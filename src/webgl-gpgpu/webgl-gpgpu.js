
import * as twgl from 'twgl.js';
import { m4 } from '../math/m4';
import computeFragmentShaderSource from './shader/compute-fragment.glsl';
import computeVertexShaderSource from './shader/compute-vertex.glsl';
import drawFragmentShaderSource from './shader/draw-fragment.glsl';
import drawVertexShaderSource from './shader/draw-vertex.glsl';

export class WebGLGPGPU {
    oninit;

    #time = 0;
    #deltaTime = 0;
    #isDestroyed = false;

    camera = {
        rotation: 0,
        position: [0, 0, 100],
        matrix: twgl.m4.identity()
    };

    constructor(canvas, pane, oninit = null) {
        this.canvas = canvas;
        this.pane = pane;
        this.oninit = oninit;

        this.#init();
    }

    resize() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.#updateProjectionMatrix();
    }

    run(time = 0) {
        this.#deltaTime = time - this.#time;
        this.#time = time;

        if (this.#isDestroyed) return;

        this.computeUniforms.u_deltaTime = this.#deltaTime;

        this.#render();

        requestAnimationFrame((t) => this.run(t));
    }

    #render() {
        // Draw
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.DST_ALPHA);

        // compute the new positions
        this.gl.enable(this.gl.RASTERIZER_DISCARD);
        this.gl.useProgram(this.computeProgram);
        this.gl.bindVertexArray(this.currentRenderState.computeVAO);
        this.gl.uniform1f(this.computeLocations.u_deltaTime, this.computeUniforms.u_deltaTime);
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.currentRenderState.transformFeedback);
        this.gl.beginTransformFeedback(this.gl.POINTS);
        this.gl.drawArrays(this.gl.POINTS, 0, this.NUM_PARTICLES);
        this.gl.endTransformFeedback();
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null);
        this.gl.disable(this.gl.RASTERIZER_DISCARD);

        // draw the particles
        this.gl.useProgram(this.drawProgram);
        this.gl.bindVertexArray(this.currentRenderState.drawVAO);
        this.gl.uniformMatrix4fv(this.drawLocations.u_worldMatrix, false, this.drawUniforms.u_worldMatrix);
        this.gl.uniformMatrix4fv(this.drawLocations.u_viewMatrix, false, this.drawUniforms.u_viewMatrix);
        this.gl.uniformMatrix4fv(this.drawLocations.u_projectionMatrix, false, this.drawUniforms.u_projectionMatrix);
        this.gl.drawArrays(this.gl.POINTS, 0, this.NUM_PARTICLES);

        // swap the render states
        const currentState = this.currentRenderState;
        this.currentRenderState = this.nextRenderState;
        this.nextRenderState = currentState;
    }

    destroy() {
        this.#isDestroyed = true;
    }

    #init() {
        this.gl = this.canvas.getContext('webgl2', { antialias: true });
        if (!this.gl) {
            throw new Error('No WebGL 2 context!')
        }

        // setup programs
        this.computeProgram = this.#createProgram(this.gl, [computeVertexShaderSource, computeFragmentShaderSource], ['t_newPosition']);
        this.drawProgram = this.#createProgram(this.gl, [drawVertexShaderSource, drawFragmentShaderSource]);

        // find the locations
        this.computeLocations = {
            a_oldPosition: this.gl.getAttribLocation(this.computeProgram, 'a_oldPosition'),
            a_velocity: this.gl.getAttribLocation(this.computeProgram, 'a_velocity'),
            u_deltaTime: this.gl.getUniformLocation(this.computeProgram, 'u_deltaTime')
        };
        this.drawLocations = {
            a_position: this.gl.getAttribLocation(this.drawProgram, 'a_position'),
            u_worldMatrix: this.gl.getUniformLocation(this.drawProgram, 'u_worldMatrix'),
            u_viewMatrix: this.gl.getUniformLocation(this.drawProgram, 'u_viewMatrix'),
            u_projectionMatrix: this.gl.getUniformLocation(this.drawProgram, 'u_projectionMatrix')
        };

        // init the positions and velocities
        this.NUM_PARTICLES = 10000;
        const positions = new Float32Array(Array(this.NUM_PARTICLES).fill(0).map(_ => Array(3).fill(0).map(_ => Math.random())).flat());
        const velocities = new Float32Array(Array(this.NUM_PARTICLES).fill(0).map(_ => Array(3).fill(0).map(_ => (Math.random() * 2 - 1) * 0.0001 )).flat());

        // make the buffers
        this.position1Buffer = this.#makeBuffer(this.gl, positions, this.gl.DYNAMIC_DRAW);
        this.position2Buffer = this.#makeBuffer(this.gl, positions, this.gl.DYNAMIC_DRAW);
        this.velocitiesBuffer = this.#makeBuffer(this.gl, velocities, this.gl.STATIC_DRAW);

        // create the compute VAOs
        this.compute1VAO = this.#makeVertexArray(this.gl, [
            [this.position1Buffer, this.computeLocations.a_oldPosition],
            [this.velocitiesBuffer, this.computeLocations.a_velocity]
        ]);
        this.compute2VAO = this.#makeVertexArray(this.gl, [
            [this.position2Buffer, this.computeLocations.a_oldPosition],
            [this.velocitiesBuffer, this.computeLocations.a_velocity]
        ]);

        // create the draw VAOs
        this.draw1VAO = this.#makeVertexArray(this.gl, [
            [this.position1Buffer, this.drawLocations.a_position]
        ]);
        this.draw2VAO = this.#makeVertexArray(this.gl, [
            [this.position2Buffer, this.drawLocations.a_position]
        ]);

        // make the transform feedbacks
        this.transformFeedback1 = this.#makeTransformFeedback(this.gl, this.position1Buffer);
        this.transformFeedback2 = this.#makeTransformFeedback(this.gl, this.position2Buffer);

        this.computeUniforms = {
            u_deltaTime: 0
        };

        // init the global uniforms
        this.drawUniforms = {
            u_worldMatrix: twgl.m4.translate(twgl.m4.scaling([100, 100, 100]), [-.5, -.5, -.5]),
            u_viewMatrix: twgl.m4.identity(),
            u_projectionMatrix: twgl.m4.identity()
        };

        // unbind left over stuff
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.TRANSFORM_FEEDBACK_BUFFER, null);

        // this are the render states
        this.currentRenderState = {
            computeVAO: this.compute1VAO,
            transformFeedback: this.transformFeedback2,
            drawVAO: this.draw2VAO
        };
        this.nextRenderState = {
            computeVAO: this.compute2VAO,
            transformFeedback: this.transformFeedback1,
            drawVAO: this.draw1VAO
        };

        this.resize();

        this.#updateCameraMatrix();
        this.#updateProjectionMatrix();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
    }

    #makeTransformFeedback(gl, buffer) {
        const tf = gl.createTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
        return tf;
    }

    #makeVertexArray(gl, bufLocPairs) {
        const va = gl.createVertexArray();
        gl.bindVertexArray(va);
        for (const [buffer, loc] of bufLocPairs) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(
                loc,      // attribute location
                3,        // number of elements
                gl.FLOAT, // type of data
                false,    // normalize
                0,        // stride (0 = auto)
                0,        // offset
            );
        }
        return va;
    }

    #makeBuffer(gl, sizeOrData, usage) {
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
        return buf;
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

    #createProgram(gl, shaderSources, transformFeedbackVaryings) {
        const program = gl.createProgram();

        [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
            const shader = this.#createShader(gl, type, shaderSources[ndx]);
            gl.attachShader(program, shader);
        });

        if (transformFeedbackVaryings) {
            gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
        }

        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);

        if (success) {
            return program;
        }

        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    #updateCameraMatrix() {
        twgl.m4.lookAt(this.camera.position, [0, 0, 0], [0, 1, 0], this.camera.matrix);
        twgl.m4.inverse(this.camera.matrix, this.drawUniforms.u_viewMatrix);
    }

    #updateProjectionMatrix() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        twgl.m4.perspective(Math.PI / 4, aspect, 50, 150, this.drawUniforms.u_projectionMatrix);
    }

    #initTweakpane() {
        if (this.pane) {
            const cameraYSlider = this.pane.addBlade({
                view: 'slider',
                label: 'c.y',
                min: -100,
                max: 100,
                value: this.camera.position[1],
            });

            cameraYSlider.on('change', e => {
                this.camera.position[1] = e.value;
                this.#updateCameraMatrix();
            });
            const cameraXSlider = this.pane.addBlade({
                view: 'slider',
                label: 'c.x',
                min: -100,
                max: 100,
                value: this.camera.position[0],
            });

            cameraXSlider.on('change', e => {
                this.camera.position[0] = e.value;
                this.#updateCameraMatrix();
            });
        }
    }
}
