
import { m4 } from '../math/m4';
import fragmentShaderSource from './shader/fragment.glsl';
import vertexShaderSource from './shader/vertex.glsl';

export class WebGL3d {
    oninit;

    #time = 0;
    #isDestroyed = false;

    constructor(canvas, pane, oninit = null) {
        this.canvas = canvas;
        this.pane = pane;
        this.oninit = oninit;

        this.image = new Image();
        this.image.src = new URL('../assets/f-texture.png', import.meta.url);
        this.image.onload = () => {
            this.#updateTexture();
        }

        this.#init();
    }

    resize() {
        this.#resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        
        // set the projection matrix
        this.#updateProjectionMatrix();

        // set the view projection matrix
        this.viewProjectionMatrix = m4.multiply(this.projectionMatrix, this.viewMatrix);
    }

    run() {
        this.lastFrameTime = performance.now();
        this.#animate(this.lastFrameTime);
    }

    #animate(time) {
        const delta = time - this.lastFrameTime;
        this.lastFrameTime = time;

        if (this.#isDestroyed) return;

        this.#render();

        // update uniforms
        this.gl.uniform1f(this.timeUniformLocation, this.#time);

        this.#time += 0.01;

        // animation models
        this.rotation[1] += (delta / 5000) * Math.PI * 2;

        this.#updateModelMatrix();

        requestAnimationFrame(t => this.#animate(t));
    }

    #render() {
        // Draw
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vertexArrayObject);

        // Set the matrix uniform
        let matrix = m4.multiply(this.viewProjectionMatrix, this.modelMatrix);
        this.gl.uniformMatrix4fv(this.matrixUniformLocation, false, matrix);
        
        // Draw the geometry.
        const primitiveType = this.gl.TRIANGLES;
        const offset = 0;
        const count = 16 * 6;
        this.gl.drawArrays(primitiveType, offset, count);

        /*const radius = 200;
        for (var ii = 0; ii < 6; ++ii) {
            var angle = ii * Math.PI * 2 / 6;
            
            var x = Math.cos(angle) * radius;
            var z = Math.sin(angle) * radius;
            // add in the translation for this F
            var matrix = m4.translate(this.viewProjectionMatrix, x, 0, z);
            matrix = m4.multiply(matrix, this.modelMatrix);
            
            // Set the matrix.
            this.gl.uniformMatrix4fv(this.matrixUniformLocation, false, matrix);
            
            // Draw the geometry.
            var primitiveType = this.gl.TRIANGLES;
            var offset = 0;
            var count = 16 * 6;
            this.gl.drawArrays(primitiveType, offset, count);
        }*/
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

        // Attribute locations
        const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        const colorAttributeLocation = this.gl.getAttribLocation(this.program, 'a_color');
        const uvAttributeLocation = this.gl.getAttribLocation(this.program, 'a_uv');

        // Uniform locations
        this.timeUniformLocation = this.gl.getUniformLocation(this.program, 'u_time');
        this.matrixUniformLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
        this.imageUniformLocation = this.gl.getUniformLocation(this.program, 'u_image');

        // Create the vertex array object and set is as the active one
        this.vertexArrayObject = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vertexArrayObject);


        //////////////////// POSITION BUFFER
        // create the buffer for the position buffer
        const positionBuffer = this.gl.createBuffer();

        // Turn on the position attribute
        this.gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

        // fill the position buffer via the ARRAY_BUFFER "pointer"
        this.#setGeometry(this.gl);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        this.gl.vertexAttribPointer(positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);


        //////////////////// COLOR BUFFER
        const colorBuffer = this.gl.createBuffer();
        this.gl.enableVertexAttribArray(colorAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.#setColor(this.gl);
        this.gl.vertexAttribPointer(colorAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);


        //////////////////// UV BUFFER
        const uvBuffer = this.gl.createBuffer();
        this.gl.enableVertexAttribArray(uvAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
        this.#setUVs(this.gl);
        this.gl.vertexAttribPointer(uvAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);


        // Init the image texture
        this.imageTexture = this.#createAndSetupTexture(this.gl);
        // Fill the texture with a 1x1 white pixel.
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));


        // enable backface culling
        this.gl.enable(this.gl.CULL_FACE);
        // enable the z-depth tests to discard pixels occluded by other pixels
        this.gl.enable(this.gl.DEPTH_TEST);


        // init the transformation properties
        this.origin = [0, 0, 0];
        this.translation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.rotation = [0, 0, 0];
        this.#updateModelMatrix();

        // init projection
        this.#updateProjectionMatrix();

        // init camera
        this.cameraRotationY = 0;
        this.#updateCameraMatrix();

        this.resize();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
    }

    #updateTexture() {
        // replace the placeholder texture
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
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

    #updateProjectionMatrix() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 1;
        const zFar = 2000;
        const fov = 75 * (Math.PI / 180);
        this.projectionMatrix = m4.perspective(fov, aspect, zNear, zFar);
    }

    #updateCameraMatrix() {
        // init the camera matrix
        this.cameraMatrix = m4.yRotation(this.cameraRotationY);
        this.cameraMatrix = m4.translate(this.cameraMatrix, 0, 0, 400);

        // init the view matrix
        this.viewMatrix = m4.inverse(this.cameraMatrix);

        // update the view projection matrix
        this.viewProjectionMatrix = m4.multiply(this.projectionMatrix, this.viewMatrix);
    }

    #updateModelMatrix() {
        this.modelMatrix = m4.translation(this.translation[0], this.translation[1], this.translation[2]);
        this.modelMatrix = m4.xRotate(this.modelMatrix, this.rotation[0]);
        this.modelMatrix = m4.yRotate(this.modelMatrix, this.rotation[1]);
        this.modelMatrix = m4.zRotate(this.modelMatrix, this.rotation[2]);
        this.modelMatrix = m4.scale(this.modelMatrix, this.scale[0], this.scale[1], this.scale[2]);
        this.modelMatrix = m4.translate(this.modelMatrix, -this.origin[0], -this.origin[1], -this.origin[2]);
    }

    #setColor(gl) {
        const colorBuffer = new Float32Array(16 * 6 * 3);
        const i = 0;
        for(let f=0; f<16; f++) {
            const faceColor = [
                Math.random() * 0.5, 
                Math.random() * 0, 
                Math.random() * 0.5 + 0.5
            ];
            
            for(let vi=0; vi<6; vi++) {
                colorBuffer.set([...faceColor], i * 3);
                i++;
            }
        }

        gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.STATIC_DRAW);
    }

    // Fill the current ARRAY_BUFFER buffer
    // with the values that define a letter 'F'.
    #setGeometry(gl) {

        const positions = new Float32Array([
            // left column front
            0,   0,  0,
            0, 150,  0,
            30,   0,  0,
            0, 150,  0,
            30, 150,  0,
            30,   0,  0,

            // top rung front
            30,   0,  0,
            30,  30,  0,
            100,   0,  0,
            30,  30,  0,
            100,  30,  0,
            100,   0,  0,

            // middle rung front
            30,  60,  0,
            30,  90,  0,
            67,  60,  0,
            30,  90,  0,
            67,  90,  0,
            67,  60,  0,

            // left column back
                0,   0,  30,
            30,   0,  30,
                0, 150,  30,
                0, 150,  30,
            30,   0,  30,
            30, 150,  30,

            // top rung back
            30,   0,  30,
            100,   0,  30,
            30,  30,  30,
            30,  30,  30,
            100,   0,  30,
            100,  30,  30,

            // middle rung back
            30,  60,  30,
            67,  60,  30,
            30,  90,  30,
            30,  90,  30,
            67,  60,  30,
            67,  90,  30,

            // top
                0,   0,   0,
            100,   0,   0,
            100,   0,  30,
                0,   0,   0,
            100,   0,  30,
                0,   0,  30,

            // top rung right
            100,   0,   0,
            100,  30,   0,
            100,  30,  30,
            100,   0,   0,
            100,  30,  30,
            100,   0,  30,

            // under top rung
            30,   30,   0,
            30,   30,  30,
            100,  30,  30,
            30,   30,   0,
            100,  30,  30,
            100,  30,   0,

            // between top rung and middle
            30,   30,   0,
            30,   60,  30,
            30,   30,  30,
            30,   30,   0,
            30,   60,   0,
            30,   60,  30,

            // top of middle rung
            30,   60,   0,
            67,   60,  30,
            30,   60,  30,
            30,   60,   0,
            67,   60,   0,
            67,   60,  30,

            // right of middle rung
            67,   60,   0,
            67,   90,  30,
            67,   60,  30,
            67,   60,   0,
            67,   90,   0,
            67,   90,  30,

            // bottom of middle rung.
            30,   90,   0,
            30,   90,  30,
            67,   90,  30,
            30,   90,   0,
            67,   90,  30,
            67,   90,   0,

            // right of bottom
            30,   90,   0,
            30,  150,  30,
            30,   90,  30,
            30,   90,   0,
            30,  150,   0,
            30,  150,  30,

            // bottom
            0,   150,   0,
            0,   150,  30,
            30,  150,  30,
            0,   150,   0,
            30,  150,  30,
            30,  150,   0,

            // left side
            0,   0,   0,
            0,   0,  30,
            0, 150,  30,
            0,   0,   0,
            0, 150,  30,
            0, 150,   0]);

        const matrix = m4.translate(m4.xRotation(Math.PI), -50, -75, -15);

        for (var ii = 0; ii < positions.length; ii += 3) {
            var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
            positions[ii + 0] = vector[0];
            positions[ii + 1] = vector[1];
            positions[ii + 2] = vector[2];
        }

        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    }

    #setUVs(gl) {
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
              // left column front
         38 / 255,  44 / 255,
         38 / 255, 223 / 255,
        113 / 255,  44 / 255,
         38 / 255, 223 / 255,
        113 / 255, 223 / 255,
        113 / 255,  44 / 255,

        // top rung front
        113 / 255, 44 / 255,
        113 / 255, 85 / 255,
        218 / 255, 44 / 255,
        113 / 255, 85 / 255,
        218 / 255, 85 / 255,
        218 / 255, 44 / 255,

        // middle rung front
        113 / 255, 112 / 255,
        113 / 255, 151 / 255,
        203 / 255, 112 / 255,
        113 / 255, 151 / 255,
        203 / 255, 151 / 255,
        203 / 255, 112 / 255,

        // left column back
         38 / 255,  44 / 255,
        113 / 255,  44 / 255,
         38 / 255, 223 / 255,
         38 / 255, 223 / 255,
        113 / 255,  44 / 255,
        113 / 255, 223 / 255,

        // top rung back
        113 / 255, 44 / 255,
        218 / 255, 44 / 255,
        113 / 255, 85 / 255,
        113 / 255, 85 / 255,
        218 / 255, 44 / 255,
        218 / 255, 85 / 255,

        // middle rung back
        113 / 255, 112 / 255,
        203 / 255, 112 / 255,
        113 / 255, 151 / 255,
        113 / 255, 151 / 255,
        203 / 255, 112 / 255,
        203 / 255, 151 / 255,

        // top
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        // top rung right
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        // under top rung
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // between top rung and middle
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // top of middle rung
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // right of middle rung
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // bottom of middle rung.
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // right of bottom
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // bottom
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // left side
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
            ]),
            gl.STATIC_DRAW);
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

            const cameraRYSlider = this.pane.addBlade({
                view: 'slider',
                label: 'camera RY',
                min: 0,
                max: 2 * Math.PI,
                value: 0,
            });

            cameraRYSlider.on('change', e => {
                this.cameraRotationY = e.value;
                this.#updateCameraMatrix();
            });
        }
    }
}
