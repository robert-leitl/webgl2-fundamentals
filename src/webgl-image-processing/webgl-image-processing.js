
import fragmentShaderSource from './shader/fragment.glsl';
import vertexShaderSource from './shader/vertex.glsl';

export class WebglImageProcessing {
    oninit;

    kernels = {
        normal: [
            0, 0, 0,
            0, 1, 0,
            0, 0, 0
        ],
        blur: [
            0.045, 0.122, 0.045,
            0.122, 0.332, 0.122,
            0.045, 0.122, 0.045
        ],
        unsharpen: [
            -1, -1, -1,
            -1,  9, -1,
            -1, -1, -1
        ],
        emboss: [
            -2, -1,  0,
            -1,  1,  1,
            0,  1,  2
        ]
    };
    effectsToApply = {
        blur: false,
        emboss: false,
        unsharpen: false
    };

    #time = 0;
    #isDestroyed = false;

    constructor(canvas, pane, oninit = null) {
        this.canvas = canvas;
        this.pane = pane;
        this.oninit = oninit;

        this.image = new Image();
        this.image.src = new URL('../assets/image.jpeg', import.meta.url);
        this.image.onload = () => {
            this.#init();
        }
    }

    resize() {
        this.#resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    run() {
        if (this.#isDestroyed) return;

        this.#render();

        // update uniforms
        this.gl.uniform4f(this.colorUniformLocation, 1, 0, 0, 1);
        this.gl.uniform1f(this.timeUniformLocation, this.#time);

        this.#time += 0.01;

        requestAnimationFrame(() => this.run());
    }

    #render() {
        // Draw
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.#drawEffects(this.gl);
    }

    destroy() {
        this.#isDestroyed = true;
    }

    #init() {
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            throw new Error('No WebGL 2 context!')
        }

        this.vertexShader = this.#createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        this.fragmentShader = this.#createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.#createProgram(this.gl, this.vertexShader, this.fragmentShader);

        // Attribute Locations
        const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        const uvAttribLocation = this.gl.getAttribLocation(this.program, 'a_uv');

        // Uniforms
        this.colorUniformLocation = this.gl.getUniformLocation(this.program, 'u_color');
        this.timeUniformLocation = this.gl.getUniformLocation(this.program, 'u_time');
        this.imageUniformLocation = this.gl.getUniformLocation(this.program, 'u_image');
        this.kernelUniformLocation = this.gl.getUniformLocation(this.program, 'u_kernel');
        this.kernelWeightUniformLocation = this.gl.getUniformLocation(this.program, 'u_kernelWeight');

        // set of attributes
        this.vertexArrayObject = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vertexArrayObject);

        // Postion Buffer
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1, 3,
            -1, -1,
            3, -1
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        // this also binds the positionBuffer to the attribute --> ARRAY_BUFFER is free
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        // UV Buffer
        const uvBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
        const uvs = [
            0, 2,
            0, 0,
            2, 0
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uvs), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(uvAttribLocation);
        this.gl.vertexAttribPointer(uvAttribLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Create the image texture and upload it to the gpu
        this.imageTexture = this.#createAndSetupTexture(this.gl);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);

        // Init framebuffers
        this.framebuffers = [];
        this.framebufferTextures = [];
        for(let i=0; i<2; ++i) {
            const texture = this.#createAndSetupTexture(this.gl);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.image.width, this.image.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
            this.framebufferTextures.push(texture);
            const framebuffer = this.gl.createFramebuffer();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
            const fboAttachementPoint = this.gl.COLOR_ATTACHMENT0;
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, fboAttachementPoint, this.gl.TEXTURE_2D, texture, 0);
            this.framebuffers.push(framebuffer);
        }

        this.resize();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
    }

    #drawEffects(gl) {
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vertexArrayObject);

        // use image texture
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);

        // tell the shader to use texture at unit 0
        gl.uniform1i(this.imageUniformLocation, 0);

        let count = 0;
        for(let key in this.effectsToApply) {
            if (!this.effectsToApply[key]) continue;

            // set the framebuffer to render to
            const fbo = this.framebuffers[count % 2];
            this.#setFramebuffer(this.gl, fbo, this.image.width, this.image.height);

            // render with this kernel
            const kernel = this.kernels[key];
            this.#drawWithKernel(this.gl, kernel);

            // set the input texture to the currently used framebuffer texture (for the next draw call)
            gl.bindTexture(gl.TEXTURE_2D, this.framebufferTextures[count % 2]);

            count++;
        }

        // the final draw to screen
        this.#setFramebuffer(this.gl, null, gl.canvas.width, gl.canvas.height);
        this.#drawWithKernel(this.gl, this.kernels['normal']);
    }

    #setFramebuffer(gl, fbo, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); // all draw commands will affect the framebuffer
        gl.viewport(0, 0, width, height);
    }

    #drawWithKernel(gl, kernel) {
        gl.uniform1fv(this.kernelUniformLocation, kernel);
        gl.uniform1f(this.kernelWeightUniformLocation, this.#computeKernelWeight(kernel));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    #createAndSetupTexture(gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }

    #createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

        if (success) {
            return shader;
        }

        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    #createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);

        if (success) {
            return program;
        }

        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    #resizeCanvasToDisplaySize(canvas) {
        // Lookup the size the browser is displaying the canvas in CSS pixels.
        const displayWidth  = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
       
        // Check if the canvas is not the same size.
        const needResize = canvas.width  !== displayWidth ||
                           canvas.height !== displayHeight;
       
        if (needResize) {
          // Make the canvas the same size
          canvas.width  = displayWidth;
          canvas.height = displayHeight;
        }
       
        return needResize;
    }

    #computeKernelWeight(kernel) {
        const weight = kernel.reduce((w, c) => w + c, 0);
        return Math.max(0, weight);
    }

    #initTweakpane() {
        if (this.pane) {
            // init tweakpane folders and inputs
            for(let key in this.effectsToApply) {
                this.pane.addInput(this.effectsToApply, key);
            }
        }
    }
}
