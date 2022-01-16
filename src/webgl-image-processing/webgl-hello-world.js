
import fragmentShaderSource from './shader/fragment.glsl';
import vertexShaderSource from './shader/vertex.glsl';

export class WebglImageProcessing {
    oninit;

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
        this.gl.uniform1i(this.imageUniformLocation, this.textureUnitIndex);

        this.#time += 0.01;

        requestAnimationFrame(() => this.run());
    }

    #render() {
        // Draw
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vertexArrayObject);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
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

        // Texture
        const imageTexture = this.gl.createTexture();
        // all texture commands will affect texture unit 0
        this.textureUnitIndex = 0;
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnitIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, imageTexture);
        // set texture params
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        // upload texture
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0, // mip level,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            this.image
        );

        this.resize();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
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

    #initTweakpane() {
        if (this.pane) {
            // init tweakpane folders and inputs
        }
    }
}
