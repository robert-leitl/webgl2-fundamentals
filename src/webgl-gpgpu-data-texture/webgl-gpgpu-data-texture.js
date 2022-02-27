
import * as twgl from 'twgl.js';
import computeFragmentShaderSource from './shader/compute-particle-position.frag';
import computeVertexShaderSource from './shader/compute-particle-position.vert';
import depositFragmentShaderSource from './shader/deposit.frag';
import depositVertexShaderSource from './shader/deposit.vert';
import drawFragmentShaderSource from './shader/draw.frag';
import drawVertexShaderSource from './shader/draw.vert';
import decayFragmentShaderSource from './shader/decay.frag';
import decayVertexShaderSource from './shader/decay.vert';
import diffuseHFragmentShaderSource from './shader/diffuse-h.frag';
import diffuseHVertexShaderSource from './shader/diffuse-h.vert';
import diffuseVFragmentShaderSource from './shader/diffuse-v.frag';
import diffuseVVertexShaderSource from './shader/diffuse-v.vert';
import copyFragmentShaderSource from './shader/copy.frag';
import copyVertexShaderSource from './shader/copy.vert';

export class WebGLGPGPUDataTexture {
    oninit;

    diffuse = 1;
    decay = 0.970;
    randomStrength = 8;
    sensorDist = 16.;
    sensorAngle = Math.PI / 4.;
    sensorSize = 25;
    velocity = .9;
    steeringStrength = 0.98;

    #time = 0;
    #deltaTime = 0;
    #isDestroyed = false;

    camera = {
        rotation: 0,
        position: [0, 0, 1],
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

        this.#resizeTextures();

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
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);

        // compute the new positions
        this.gl.enable(this.gl.RASTERIZER_DISCARD);
        this.gl.useProgram(this.computeParticleProgram);
        this.gl.bindVertexArray(this.currentRenderState.computeVAO);
        this.gl.uniform1f(this.computeParticleLocations.u_deltaTime, this.computeUniforms.u_deltaTime);
        this.gl.uniform2i(this.computeParticleLocations.u_resolution, this.gl.canvas.width, this.gl.canvas.height);
        // set the data texture on texture unit 0 and update uniform
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.dataTexture1);
        this.gl.uniform1i(this.computeParticleLocations.u_dataTexture, 0);
        this.gl.uniform1f(this.computeParticleLocations.u_randomStrength, this.randomStrength);
        this.gl.uniform1f(this.computeParticleLocations.u_sensorDist, this.sensorDist);
        this.gl.uniform1f(this.computeParticleLocations.u_sensorAngle, this.sensorAngle);
        this.gl.uniform1f(this.computeParticleLocations.u_velocity, this.velocity);
        this.gl.uniform1f(this.computeParticleLocations.u_steeringStrength, this.steeringStrength);
        this.gl.uniform1f(this.computeParticleLocations.u_sensorSize, this.sensorSize);
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.currentRenderState.transformFeedback);
        this.gl.beginTransformFeedback(this.gl.POINTS);
        this.gl.drawArrays(this.gl.POINTS, 0, this.NUM_PARTICLES);
        this.gl.endTransformFeedback();
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null);
        this.gl.disable(this.gl.RASTERIZER_DISCARD);

        // deposit the particles
        this.#setFramebuffer(this.gl, this.fbo1, this.gl.canvas.width, this.gl.canvas.height);
        // copy the last result
        this.gl.useProgram(this.copyProgram);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.dataTexture2);
        this.gl.uniform1i(this.copyLocations.u_texture, 0);
        this.gl.bindVertexArray(this.quadVAO);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // deposit the new particle positions
        this.gl.useProgram(this.depositProgram);
        this.gl.uniform2i(this.depositLocations.u_resolution, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.bindVertexArray(this.currentRenderState.drawVAO);
        this.gl.drawArrays(this.gl.POINTS, 0, this.NUM_PARTICLES);
        this.#setFramebuffer(this.gl, null, this.gl.canvas.width, this.gl.canvas.height);

         // diffuse H
         this.#setFramebuffer(this.gl, this.fbo2, this.gl.canvas.width, this.gl.canvas.height);
         this.gl.useProgram(this.diffuseHProgram);
         this.gl.activeTexture(this.gl.TEXTURE0);
         this.gl.bindTexture(this.gl.TEXTURE_2D, this.dataTexture1);
         this.gl.uniform1i(this.diffuseHLocations.u_texture, 0);
         this.gl.uniform1f(this.diffuseHLocations.u_diffuse, this.diffuse);
         this.gl.bindVertexArray(this.quadVAO);
         this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
         this.#setFramebuffer(this.gl, null, this.gl.canvas.width, this.gl.canvas.height);

         // diffuse V
         this.#setFramebuffer(this.gl, this.fbo1, this.gl.canvas.width, this.gl.canvas.height);
         this.gl.useProgram(this.diffuseVProgram);
         this.gl.activeTexture(this.gl.TEXTURE0);
         this.gl.bindTexture(this.gl.TEXTURE_2D, this.dataTexture2);
         this.gl.uniform1i(this.diffuseVLocations.u_texture, 0);
         this.gl.uniform1f(this.diffuseVLocations.u_diffuse, this.diffuse);
         this.gl.bindVertexArray(this.quadVAO);
         this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
         this.#setFramebuffer(this.gl, null, this.gl.canvas.width, this.gl.canvas.height);
         
         // decay
         this.#setFramebuffer(this.gl, this.fbo2, this.gl.canvas.width, this.gl.canvas.height);
         this.gl.useProgram(this.decayProgram);
         this.gl.activeTexture(this.gl.TEXTURE0);
         this.gl.bindTexture(this.gl.TEXTURE_2D, this.dataTexture1);
         this.gl.uniform1i(this.decayLocations.u_texture, 0);
         this.gl.uniform1f(this.decayLocations.u_decay, this.decay);
         this.gl.bindVertexArray(this.quadVAO);
         this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
         this.#setFramebuffer(this.gl, null, this.gl.canvas.width, this.gl.canvas.height);

        // draw
        this.gl.useProgram(this.drawProgram);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.bindVertexArray(this.quadVAO);
        this.gl.uniformMatrix4fv(this.drawLocations.u_worldMatrix, false, this.drawUniforms.u_worldMatrix);
        this.gl.uniformMatrix4fv(this.drawLocations.u_viewMatrix, false, this.drawUniforms.u_viewMatrix);
        this.gl.uniformMatrix4fv(this.drawLocations.u_projectionMatrix, false, this.drawUniforms.u_projectionMatrix);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.dataTexture2);
        this.gl.uniform1i(this.drawLocations.u_texture, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // swap the render states
        const currentState = this.currentRenderState;
        this.currentRenderState = this.nextRenderState;
        this.nextRenderState = currentState;
    }

    destroy() {
        this.#isDestroyed = true;
    }

    #init() {
        /** @type {WebGLRenderingContext} */
        this.gl = this.canvas.getContext('webgl2', { antialias: true });
        if (!this.gl) {
            throw new Error('No WebGL 2 context!')
        }
        const ext = this.gl.getExtension('EXT_color_buffer_float');
        if (!ext) {
          alert('need EXT_color_buffer_float');
          return;
        }

        // setup programs
        this.computeParticleProgram = this.#createProgram(this.gl, [computeVertexShaderSource, computeFragmentShaderSource], ['t_newPosition', 't_newAngle']);
        this.depositProgram = this.#createProgram(this.gl, [depositVertexShaderSource, depositFragmentShaderSource]);
        this.drawProgram = this.#createProgram(this.gl, [drawVertexShaderSource, drawFragmentShaderSource], null, { a_position: 0, a_uv: 1 });
        this.decayProgram = this.#createProgram(this.gl, [decayVertexShaderSource, decayFragmentShaderSource], null, { a_position: 0, a_uv: 1 });
        this.diffuseHProgram = this.#createProgram(this.gl, [diffuseHVertexShaderSource, diffuseHFragmentShaderSource], null, { a_position: 0, a_uv: 1 });
        this.diffuseVProgram = this.#createProgram(this.gl, [diffuseVVertexShaderSource, diffuseVFragmentShaderSource], null, { a_position: 0, a_uv: 1 });
        this.copyProgram = this.#createProgram(this.gl, [copyVertexShaderSource, copyFragmentShaderSource], null, { a_position: 0, a_uv: 1 });

        // find the locations
        this.computeParticleLocations = {
            a_oldPosition: this.gl.getAttribLocation(this.computeParticleProgram, 'a_oldPosition'),
            a_oldVelocity: this.gl.getAttribLocation(this.computeParticleProgram, 'a_oldAngle'),
            u_deltaTime: this.gl.getUniformLocation(this.computeParticleProgram, 'u_deltaTime'),
            u_resolution: this.gl.getUniformLocation(this.computeParticleProgram, 'u_resolution'),
            u_trailsTexture: this.gl.getUniformLocation(this.computeParticleProgram, 'u_trailsTexture'),
            u_randomStrength: this.gl.getUniformLocation(this.computeParticleProgram, 'u_randomStrength'),
            u_sensorDist: this.gl.getUniformLocation(this.computeParticleProgram, 'u_sensorDist'),
            u_sensorAngle: this.gl.getUniformLocation(this.computeParticleProgram, 'u_sensorAngle'),
            u_velocity: this.gl.getUniformLocation(this.computeParticleProgram, 'u_velocity'),
            u_steeringStrength: this.gl.getUniformLocation(this.computeParticleProgram, 'u_steeringStrength'),
            u_sensorSize: this.gl.getUniformLocation(this.computeParticleProgram, 'u_sensorSize')
        };
        this.depositLocations = {
            u_resolution: this.gl.getUniformLocation(this.depositProgram, 'u_resolution'),
            a_position: this.gl.getAttribLocation(this.depositProgram, 'a_position')
        };
        this.decayLocations = {
            a_position: this.gl.getAttribLocation(this.decayProgram, 'a_position'),
            a_uv: this.gl.getAttribLocation(this.decayProgram, 'a_uv'),
            u_texture: this.gl.getUniformLocation(this.decayProgram, 'u_texture'),
            u_decay: this.gl.getUniformLocation(this.decayProgram, 'u_decay')
        };
        this.diffuseHLocations = {
            a_position: this.gl.getAttribLocation(this.diffuseHProgram, 'a_position'),
            a_uv: this.gl.getAttribLocation(this.diffuseHProgram, 'a_uv'),
            u_texture: this.gl.getUniformLocation(this.diffuseHProgram, 'u_texture'),
            u_diffuse: this.gl.getUniformLocation(this.diffuseHProgram, 'u_diffuse')
        };
        this.diffuseVLocations = {
            a_position: this.gl.getAttribLocation(this.diffuseVProgram, 'a_position'),
            a_uv: this.gl.getAttribLocation(this.diffuseVProgram, 'a_uv'),
            u_texture: this.gl.getUniformLocation(this.diffuseVProgram, 'u_texture'),
            u_diffuse: this.gl.getUniformLocation(this.diffuseVProgram, 'u_diffuse')
        };
        this.copyLocations = {
            a_position: this.gl.getAttribLocation(this.copyProgram, 'a_position'),
            a_uv: this.gl.getAttribLocation(this.copyProgram, 'a_uv'),
            u_texture: this.gl.getUniformLocation(this.copyProgram, 'u_texture')
        };
        this.drawLocations = {
            a_position: this.gl.getAttribLocation(this.drawProgram, 'a_position'),
            a_uv: this.gl.getAttribLocation(this.drawProgram, 'a_uv'),
            u_worldMatrix: this.gl.getUniformLocation(this.drawProgram, 'u_worldMatrix'),
            u_viewMatrix: this.gl.getUniformLocation(this.drawProgram, 'u_viewMatrix'),
            u_projectionMatrix: this.gl.getUniformLocation(this.drawProgram, 'u_projectionMatrix'),
            u_texture: this.gl.getUniformLocation(this.drawProgram, 'u_texture')
        };

        // init the positions and velocities
        this.NUM_PARTICLES = 100000;
        const angles = new Float32Array(Array(this.NUM_PARTICLES).fill(0).map(_ => Math.random() * Math.PI * 2));
        const positions = new Float32Array(Array(
            this.NUM_PARTICLES).fill(0).map((_, ndx) => 
                //[this.canvas.clientWidth, this.canvas.clientHeight].map(m => this.#rand(0, m))
                [-Math.cos(angles[ndx]) * Math.random() * 200 + this.canvas.clientWidth / 2, -Math.sin(angles[ndx]) * Math.random() * 200 + this.canvas.clientHeight / 2]
            ).flat()
        );
        

        // make the buffers
        this.position1Buffer = this.#makeBuffer(this.gl, positions, this.gl.DYNAMIC_DRAW);
        this.position2Buffer = this.#makeBuffer(this.gl, positions, this.gl.DYNAMIC_DRAW);
        this.angles1Buffer = this.#makeBuffer(this.gl, angles, this.gl.DYNAMIC_DRAW);
        this.angles2Buffer = this.#makeBuffer(this.gl, angles, this.gl.DYNAMIC_DRAW);

        // create the compute VAOs
        this.compute1VAO = this.#makeVertexArray(this.gl, [ 
            [this.position1Buffer, this.computeParticleLocations.a_oldPosition, 2],
            [this.angles1Buffer, this.computeParticleLocations.a_oldAngle, 1]
        ]);
        this.compute2VAO = this.#makeVertexArray(this.gl, [
            [this.position2Buffer, this.computeParticleLocations.a_oldPosition, 2],
            [this.angles2Buffer, this.computeParticleLocations.a_oldAngle, 1]
        ]);

        // create the draw VAOs
        this.draw1VAO = this.#makeVertexArray(this.gl, [
            [this.position1Buffer, this.depositLocations.a_position, 2]
        ]);
        this.draw2VAO = this.#makeVertexArray(this.gl, [
            [this.position2Buffer, this.depositLocations.a_position, 2]
        ]);

        // make the transform feedbacks
        this.pos1TF = this.#makeTransformFeedback(this.gl, [this.position1Buffer, this.angles1Buffer]);
        this.pos2TF = this.#makeTransformFeedback(this.gl, [this.position2Buffer, this.angles2Buffer]);

        // create the texture
        this.dataTexture1 = this.#createAndSetupTexture(this.gl);
        this.dataTexture2 = this.#createAndSetupTexture(this.gl);

        // create the framebuffer 
        this.fbo1 = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo1);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.dataTexture1, 0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.fbo2 = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo2);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.dataTexture2, 0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        // create the quad buffers
        this.quadPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 
            new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                -1,  1,
                 1, -1,
                 1,  1
            ]),
            this.gl.STATIC_DRAW);
        this.quadUVBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadUVBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 
            new Float32Array([
                 0, 0,
                 1, 0,
                 0, 1,
                 0, 1,
                 1, 0,
                 1, 1
            ]),
            this.gl.STATIC_DRAW);

        // create the quad VAO
        this.quadVAO = this.#makeVertexArray(this.gl, [
            [this.quadPositionBuffer, this.drawLocations.a_position, 2],
            [this.quadUVBuffer, this.drawLocations.a_uv, 2]
        ]);

        this.computeUniforms = {
            u_deltaTime: 0
        };

        // init the global uniforms
        this.drawUniforms = {
            u_worldMatrix: twgl.m4.identity(),
            u_viewMatrix: twgl.m4.identity(),
            u_projectionMatrix: twgl.m4.identity()
        };

        // unbind left over stuff
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.TRANSFORM_FEEDBACK_BUFFER, null);

        // this are the render states
        this.currentRenderState = {
            computeVAO: this.compute1VAO,
            transformFeedback: this.pos2TF,
            drawVAO: this.draw2VAO
        };
        this.nextRenderState = {
            computeVAO: this.compute2VAO,
            transformFeedback: this.pos1TF,
            drawVAO: this.draw1VAO
        };

        this.resize();

        this.#updateCameraMatrix();
        this.#updateProjectionMatrix();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
    }

    #resizeTextures() {
        const w = this.gl.canvas.width;
        const h = this.gl.canvas.height;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.dataTexture1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R32F, w, h, 0, this.gl.RED, this.gl.FLOAT, new Float32Array(w * h));
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.dataTexture2);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R32F, w, h, 0, this.gl.RED, this.gl.FLOAT, new Float32Array(w * h));
    }

    #rand = (min, max) => {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }

    #makeTransformFeedback(gl, buffers) {
        const tf = gl.createTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
        buffers.forEach((buffer, ndx) => {
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, ndx, buffer);
        })
        return tf;
    }

    #createAndSetupTexture(gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }

    #setFramebuffer(gl, fbo, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); // all draw commands will affect the framebuffer
        gl.viewport(0, 0, width, height);
    }

    #makeVertexArray(gl, bufLocPairs) {
        const va = gl.createVertexArray();
        gl.bindVertexArray(va);
        for (const [buffer, loc, numElements] of bufLocPairs) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(
                loc,      // attribute location
                numElements,        // number of elements
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

    #createProgram(gl, shaderSources, transformFeedbackVaryings, attribLocations) {
        const program = gl.createProgram();

        [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
            const shader = this.#createShader(gl, type, shaderSources[ndx]);
            gl.attachShader(program, shader);
        });

        if (transformFeedbackVaryings) {
            gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
        }

        if (attribLocations) {
            for(const attrib in attribLocations) {
                gl.bindAttribLocation(program, attribLocations[attrib], attrib);
            }
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
        /* const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        twgl.m4.perspective(Math.PI / 4, aspect, 50, 150, this.drawUniforms.u_projectionMatrix);*/
        twgl.m4.ortho(-1, 1, -1, 1, 0, 2, this.drawUniforms.u_projectionMatrix);
    }

    #initTweakpane() {
        if (this.pane) {
            this.#createSlider(this.pane, 'decay', 0.8, 0.99999);
            this.#createSlider(this.pane, 'diffuse', 0, 1);
            this.#createSlider(this.pane, 'randomStrength', 0.1, 10);
            this.#createSlider(this.pane, 'sensorDist', 3, 50);
            this.#createSlider(this.pane, 'sensorSize', 1, 30);
            this.#createSlider(this.pane, 'sensorAngle', 0, Math.PI / 2);
            this.#createSlider(this.pane, 'velocity', 0.05, 2);
            this.#createSlider(this.pane, 'steeringStrength', 0.2, 1);
        }
    }

    #createSlider(pane, name, min, max) {
        const slider = pane.addBlade({
            view: 'slider',
            label: name,
            min,
            max,
            value: this[name],
        });

        slider.on('change', e => {
            this[name] = e.value;
            this.#updateCameraMatrix();
        });
    }
}
