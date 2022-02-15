
import * as twgl from 'twgl.js';
import { m4 } from '../math/m4';
import fFragmentShaderSource from './shader/f-fragment.glsl';
import fVertexShaderSource from './shader/f-vertex.glsl';

export class WebGLText {
    oninit;

    #time = 0;
    #deltaTime = 0;
    #isDestroyed = false;

    camera = {
        radius: 1000,
        rotation: 0,
        position: [0, 0, 0],
        matrix: twgl.m4.identity()
    };

    constructor(canvas, pane, oninit = null) {
        this.canvas = canvas;
        this.pane = pane;
        this.oninit = oninit;

        this.#init();
    }

    resize() {
        this.#resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.#updateProjectionMatrix();
    }

    run(time = 0) {
        this.#deltaTime = time - this.#time;
        this.#time = time;

        if (this.#isDestroyed) return;

        // animate the camera rotation
        this.camera.rotation += (this.#deltaTime / 8000) * Math.PI * 2; // one rotation every 8 seconds
        this.camera.position[0] = Math.cos(this.camera.rotation) * this.camera.radius;
        this.camera.position[2] = Math.sin(this.camera.rotation) * this.camera.radius;
        this.#updateCameraMatrix();

        this.#render();

        requestAnimationFrame((t) => this.run(t));
    }

    #render() {
        // Draw
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        // draw Fs
        this.gl.useProgram(this.fProgramInfo.program);
        this.gl.bindVertexArray(this.fVAO);
        const modelUniforms = {
            u_worldMatrix: twgl.m4.identity()
        };

        const numColumns = 4;
        const numRows = 4;
        const spread = 200;
        const fWorldMatrices = [];
        for(let c=0; c<numColumns; c++) {
            for(let r=0; r<numRows; r++) {
                const fWorldMatrix = twgl.m4.translation([
                    c * spread - ((numColumns - 1)  * spread) / 2,
                    r * spread - ((numRows - 1)  * spread) / 2,
                    0
                ]);
                const rX = (this.#time / (3000) + (r * c * 0.035)) * Math.PI * 2;
                const rY = (this.#time / (3000) + (r * c * 0.015)) * Math.PI * 2;

                twgl.m4.rotateX(fWorldMatrix, rX, fWorldMatrix);
                twgl.m4.rotateY(fWorldMatrix, rY, fWorldMatrix);
                twgl.m4.translate(fWorldMatrix, this.fOrigin, fWorldMatrix);

                fWorldMatrices.push(fWorldMatrix);

                //twgl.m4.multiply(fWorldMatrix, spreadMatrix, modelUniforms.u_worldMatrix);
                modelUniforms.u_worldMatrix = fWorldMatrix;

                const fUniforms = { ...this.globalUniforms, ...modelUniforms };
                twgl.setUniforms(this.fProgramInfo, fUniforms);
                twgl.drawBufferInfo(this.gl, this.fBufferInfo);
            }
        }

        // position the html overlay
        const overlayMatrix = fWorldMatrices[6];
        twgl.m4.multiply(this.globalUniforms.u_viewMatrix, overlayMatrix, overlayMatrix);
        twgl.m4.multiply(this.globalUniforms.u_projectionMatrix, overlayMatrix, overlayMatrix);
        //let overlayPosition = twgl.m4.transformPoint(overlayMatrix, [0, 0, 0, 1]);
        let overlayPosition = m4.transformVector(overlayMatrix, [0, 0, 0, 1]);
        overlayPosition = twgl.v3.divScalar(overlayPosition, overlayPosition[3]);
        overlayPosition = twgl.v3.multiply(
            overlayPosition, 
            [this.gl.canvas.clientWidth * .5, -this.gl.canvas.clientHeight * 0.5, 0]
        );
        overlayPosition = twgl.v3.add(overlayPosition, [this.gl.canvas.clientWidth * .5, this.gl.canvas.clientHeight * 0.5, 0]);
        this.overlayElm.style.transform = `translate(${overlayPosition[0]}px,${overlayPosition[1]}px)`;
    }

    destroy() {
        this.#isDestroyed = true;
    }

    #init() {
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            throw new Error('No WebGL 2 context!')
        }

        // setup the parent element
        this.parentElm = (this.canvas.parentElement);
        this.parentElm.style.position = 'relative';

        // tell twgl to match program to a_program and
        // normal to a_normal etc...
        twgl.setAttributePrefix("a_");

        // setup programs
        this.fProgramInfo = twgl.createProgramInfo(this.gl, [fVertexShaderSource, fFragmentShaderSource]);

        // setup buffers
        this.fBufferInfo = twgl.primitives.create3DFBufferInfo(this.gl);
        this.fVAO = twgl.createVAOFromBufferInfo(this.gl, this.fProgramInfo, this.fBufferInfo);
        this.fOrigin = [-50, -75, -15];

        // init the global uniforms
        this.globalUniforms = {
            u_viewMatrix: twgl.m4.identity(),
            u_projectionMatrix: twgl.m4.identity()
        };

        this.resize();

        this.#updateCameraMatrix();
        this.#updateProjectionMatrix();

        this.#createHTMLOverlay();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
    }

    #createHTMLOverlay() {
        this.overlayElm = document.createElement('div');
        this.overlayElm.style.position = 'absolute';
        this.overlayElm.style.fontSize = '1em';
        this.overlayElm.style.color = 'white';
        this.overlayElm.style.top = 0;
        this.overlayElm.style.left = 0;
        this.overlayElm.style.borderTop = '1px solid red';
        this.overlayElm.innerText = 'HTML';

        this.parentElm.appendChild(this.overlayElm);
    }

    #updateCameraMatrix() {
        twgl.m4.lookAt(this.camera.position, [0, 0, 0], [0, 1, 0], this.camera.matrix);
        twgl.m4.inverse(this.camera.matrix, this.globalUniforms.u_viewMatrix);
    }

    #updateProjectionMatrix() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        twgl.m4.perspective(Math.PI / 4, aspect, 1, 4000, this.globalUniforms.u_projectionMatrix);
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
            const cameraRadiusSlider = this.pane.addBlade({
                view: 'slider',
                label: 'c.radius',
                min: 100,
                max: this.camera.radius * 2,
                value: this.camera.radius,
            });

            cameraRadiusSlider.on('change', e => {
                this.camera.radius = e.value;
                this.#updateCameraMatrix();
            });

            const cameraYSlider = this.pane.addBlade({
                view: 'slider',
                label: 'c.y',
                min: -1000,
                max: 1000,
                value: this.camera.position[1],
            });

            cameraYSlider.on('change', e => {
                this.camera.position[1] = e.value;
                this.#updateCameraMatrix();
            });
        }
    }
}
