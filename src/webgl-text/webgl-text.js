
import * as twgl from 'twgl.js';
import { m4 } from '../math/m4';
import fFragmentShaderSource from './shader/f-fragment.glsl';
import fVertexShaderSource from './shader/f-vertex.glsl';
import textFragmentShaderSource from './shader/text-fragment.glsl';
import textVertexShaderSource from './shader/text-vertex.glsl';

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
        this.gl.disable(this.gl.BLEND);
        this.gl.depthMask(true);

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


        // draw the text quad
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.depthMask(true);    // disable depth writing

        this.gl.useProgram(this.textProgramInfo.program);
        this.gl.bindVertexArray(this.textVAO);
        const targetFMatrix = twgl.m4.multiply(this.globalUniforms.u_viewMatrix, fWorldMatrices[9]);
        const textPos = [targetFMatrix[12], targetFMatrix[13], targetFMatrix[14]];
        const fromEye = twgl.v3.normalize(textPos);
        const offsetFromEye = 150;
        textPos[0] -= fromEye[0] * offsetFromEye;
        textPos[1] -= fromEye[1] * offsetFromEye;
        textPos[2] -= fromEye[2] * offsetFromEye;
        // make the text stay the same size
        const scale = twgl.v3.mulScalar(this.textScale, -textPos[2] / this.gl.canvas.height);
        const textMatrix = twgl.m4.scale(twgl.m4.translation(textPos), scale);
        twgl.m4.scale(textMatrix, [0.25, 0.25, 1], textMatrix);
        const textUniforms = { 
            u_worldMatrix: textMatrix,
            u_viewMatrix: twgl.m4.identity(),
            u_texture: this.textTexture 
        };
        twgl.setUniforms(this.textProgramInfo, {...this.globalUniforms, ...textUniforms});
        twgl.drawBufferInfo(this.gl, this.textBufferInfo);
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
        this.textProgramInfo = twgl.createProgramInfo(this.gl, [textVertexShaderSource, textFragmentShaderSource]);

        // setup f vertex array object and buffers
        this.fBufferInfo = twgl.primitives.create3DFBufferInfo(this.gl);
        this.fVAO = twgl.createVAOFromBufferInfo(this.gl, this.fProgramInfo, this.fBufferInfo);
        this.fOrigin = [-50, -75, -15];

        this.textBufferInfo = twgl.primitives.createXYQuadBufferInfo(this.gl, 1);
        this.textVAO = twgl.createVAOFromBufferInfo(this.gl, this.textProgramInfo, this.textBufferInfo);

        // create the text texture
        const textCanvas = this.#createCanvasText('HELLO TEXTURE!', 800, 130);
        this.textTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textTexture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); // canvas produces premultiplied alpha
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textCanvas);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.textScale = [textCanvas.width, textCanvas.height, 1];

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

    #createCanvasText(text, width, height) {
        if (!this.textCanvas) {
            this.textCanvas = document.createElement('canvas');
            this.textCanvasContext = this.textCanvas.getContext('2d');
        }

        this.textCanvasContext.canvas.width  = width;
        this.textCanvasContext.canvas.height = height;
        this.textCanvasContext.font = "bold 85px sans-serif";
        this.textCanvasContext.textAlign = "center";
        this.textCanvasContext.textBaseline = "middle";
        this.textCanvasContext.fillStyle = "white";
        this.textCanvasContext.clearRect(0, 0, this.textCanvasContext.canvas.width, this.textCanvasContext.canvas.height);
        this.textCanvasContext.fillText(text, width / 2, height / 2);

        return this.textCanvas;
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
