
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

        this.#init();
    }

    resize() {
        this.#resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.translation[0] = this.gl.canvas.width / 2;
        this.translation[1] = this.gl.canvas.height / 2;
    }

    run() {
        if (this.#isDestroyed) return;

        this.#render();

        // update uniforms
        this.gl.uniform1f(this.timeUniformLocation, this.#time);

        // Compute the matrix
        var matrix = m4.orthographic(0, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, 0, 400, -400);
        matrix = m4.translate(matrix, this.translation[0] + this.origin[0], this.translation[1] + this.origin[1], this.translation[2] + this.origin[2]);
        matrix = m4.xRotate(matrix, this.rotation[0]);
        matrix = m4.yRotate(matrix, this.rotation[1]);
        matrix = m4.zRotate(matrix, this.rotation[2]);
        matrix = m4.scale(matrix, this.scale[0], this.scale[1], this.scale[2]);
        matrix = m4.translate(matrix, -this.origin[0], -this.origin[1], -this.origin[2]);

        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixUniformLocation, false, matrix);

        this.#time += 0.01;
        this.rotation[1] += 0.03;
        this.rotation[0] += 0.028;

        requestAnimationFrame(() => this.run());
    }

    #render() {
        // Draw
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vertexArrayObject);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 16 * 6);
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

        // Uniform locations
        this.timeUniformLocation = this.gl.getUniformLocation(this.program, 'u_time');
        this.matrixUniformLocation = this.gl.getUniformLocation(this.program, 'u_matrix');

        // Create the vertex array object and set is as the active one
        this.vertexArrayObject = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vertexArrayObject);




        //////////////////// POSITION
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



        //////////////////// COLOR
        const colorBuffer = this.gl.createBuffer();
        this.gl.enableVertexAttribArray(colorAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.#setColor(this.gl);
        this.gl.vertexAttribPointer(colorAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);


        // enable backface culling
        this.gl.enable(this.gl.CULL_FACE);
        // enable the z-buffer
        this.gl.enable(this.gl.DEPTH_TEST);


        // init the transformation properties
        this.origin = [30, 100, 15];
        this.translation = [200, 200, 0];
        this.scale = [2, 2, 2];
        this.rotation = [0, 0, 0];

        this.resize();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
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
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
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
                0, 150,   0,
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
        }
    }
}
