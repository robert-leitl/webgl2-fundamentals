
import { m4 } from '../math/m4';
import chroma from 'chroma-js';
import * as twgl from 'twgl.js';
import fragmentShaderSource from './shader/fragment.glsl';
import vertexShaderSource from './shader/vertex.glsl';

const colorVS = `#version 300 es
in vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
  // Multiply the position by the matrices.
  gl_Position = u_projection * u_view * u_world * a_position;
}
`;

const colorFS = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

export class WebGLShadows {
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
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        
        // set the projection matrix
        this.#updateProjectionMatrix();
    }

    run() {
        this.lastFrameTime = performance.now();
        this.#animate(this.lastFrameTime);
    }

    #animate(time) {
        const delta = time - this.lastFrameTime;
        this.lastFrameTime = time;

        if (this.#isDestroyed) return;

        // enable backface culling
        this.gl.enable(this.gl.CULL_FACE);
        // enable the z-depth tests to discard pixels occluded by other pixels
        this.gl.enable(this.gl.DEPTH_TEST);

        this.#render();

        // animation models
        this.rotation[1] += (delta / 30000) * Math.PI * 2;
        this.#updateModelMatrix();

        requestAnimationFrame(t => this.#animate(t));
    }

    #render() {
        // ----------------------------- Draw depth buffer from the lights viewpoint
        this.#setFramebuffer(this.gl, this.depthFramebuffer, this.depthTextureSize, this.depthTextureSize);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.colorProgramInfo.program);
        twgl.setUniforms(this.colorProgramInfo, {
            u_color: [1, 1, 1, 1],
            u_view: this.lightViewMatrix,
            u_projection: this.lightProjectionMatrix
        });
        this.#renderScene(this.colorProgramInfo);

        // ----------------------------- Draw the scene
        this.#setFramebuffer(this.gl, null, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.programInfo.program);
        // Set the uniforms that are the same for all objects.
        twgl.setUniforms(this.programInfo, this.uniformsThatAreTheSameForAllObjects);
        this.#renderScene(this.programInfo);

        /////////////// Draw Light box
        this.gl.useProgram(this.colorProgramInfo.program);
        // Setup all the needed attributes.
        this. gl.bindVertexArray(this.lightBoxVertexArrayObject);
        // Set the uniforms we just computed
        twgl.setUniforms(this.colorProgramInfo, {
          u_color: [1, 1, 1, 1],
          u_view: this.viewMatrix,
          u_projection: this.projectionMatrix,
          u_world: this.lightBoxModelMatrix,
        });
        // calls gl.drawArrays or gl.drawElements
        twgl.drawBufferInfo(this.gl, this.lightBoxLinesBufferInfo, this.gl.LINES);
    }

    #renderScene(programInfo) {
        /////////////// Draw Plane
        this.gl.bindVertexArray(this.planeVertexArrayObject);
        // Set the matrix uniform
        this.uniformsThatAreComputedForEachObject.u_world = this.planeModelMatrix;
        m4.transpose(m4.inverse(this.planeModelMatrix), this.uniformsThatAreComputedForEachObject.u_worldInverseTranspose);
        twgl.setUniforms(programInfo, this.uniformsThatAreComputedForEachObject);
        // Set the uniforms that are specific to the this object.
        twgl.setUniforms(programInfo, this.material2Uniforms);
        // Draw the geometry.
        this.gl.drawElements(this.gl.TRIANGLES, this.planeBuffers.numElements, this.gl.UNSIGNED_SHORT, 0);

        /////////////// Draw object
        this.gl.bindVertexArray(this.objectVertexArrayObject);
        // Set the matrix uniform
        this.uniformsThatAreComputedForEachObject.u_world = this.modelMatrix;
        m4.transpose(m4.inverse(this.modelMatrix), this.uniformsThatAreComputedForEachObject.u_worldInverseTranspose);
        twgl.setUniforms(programInfo, this.uniformsThatAreComputedForEachObject);
        // Set the uniforms that are specific to the this object.
        twgl.setUniforms(programInfo, this.material1Uniforms);
        // Draw the geometry.
        this.gl.drawElements(this.gl.TRIANGLES, this.objectBuffers.numElements, this.gl.UNSIGNED_SHORT, 0);
    }

    destroy() {
        this.#isDestroyed = true;
    }

    degToRad(d) {
        return d * Math.PI / 180;
    }

    rand(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    };
    
    randInt(range) {
        return Math.floor(Math.random() * range);
    };

    #init() {
        this.gl = this.canvas.getContext('webgl2', {antialias: true});
        const gl = this.gl;

        if (!this.gl) {
            throw new Error('No WebGL 2 context!')
        }

        // Tell the twgl to match position with a_position,
        // normal with a_normal etc..
        twgl.setAttributePrefix("a_");

        // note: Since we're going to use the same VAO with multiple
        // shader programs we need to make sure all programs use the
        // same attribute locations. There are 2 ways to do that.
        // (1) assign them in GLSL. (2) assign them by calling `gl.bindAttribLocation`
        // before linking. We're using method 2 as it's more. D.R.Y.
        const programOptions = {
            attribLocations: {
            'a_position': 0,
            'a_normal':   1,
            'a_texcoord': 2,
            'a_color':    3,
            },
        };


        // setup GLSL program (compiles shader, links program, look up locations)
        this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource], programOptions);
        const attribSetters  = twgl.createAttributeSetters(gl, this.programInfo.program);

        // color program for lightbox
        this.colorProgramInfo = twgl.createProgramInfo(gl, [colorVS, colorFS], programOptions);

        //////////////////////// Object VAO
        this.objectBuffers = twgl.primitives.createCubeBuffers(this.gl, 20);
        this.objectBuffers = twgl.primitives.createSphereBuffers(this.gl, 15, 32, 32);
        const objectAttribs = {
            a_position: { buffer: this.objectBuffers.position, numComponents: 3, },
            a_normal:   { buffer: this.objectBuffers.normal,   numComponents: 3, },
            a_texcoord: { buffer: this.objectBuffers.texcoord, numComponents: 2, },
        };
        this.objectVertexArrayObject = twgl.createVAOAndSetAttributes(gl, attribSetters, objectAttribs, this.objectBuffers.indices);

        //////////////////////// Plane VAO
        this.planeBuffers = twgl.primitives.createPlaneBuffers(this.gl, 100, 100, 1, 1);
        const planeAttribs = {
            a_position: { buffer: this.planeBuffers.position, numComponents: 3, },
            a_normal:   { buffer: this.planeBuffers.normal,   numComponents: 3, },
            a_texcoord: { buffer: this.planeBuffers.texcoord, numComponents: 2, },
        };
        this.planeVertexArrayObject = twgl.createVAOAndSetAttributes(gl, attribSetters, planeAttribs, this.planeBuffers.indices);


        //////////////////////// Light Box VAO
        this.lightBoxLinesBufferInfo = twgl.createBufferInfoFromArrays(gl, {
            position: [
               0,  0, -1,
               1,  0, -1,
               0,  1, -1,
               1,  1, -1,
               0,  0,  1,
               1,  0,  1,
               0,  1,  1,
               1,  1,  1,
            ],
            indices: [
              0, 1,
              1, 3,
              3, 2,
              2, 0,
        
              4, 5,
              5, 7,
              7, 6,
              6, 4,
        
              0, 4,
              1, 5,
              3, 7,
              2, 6,
            ],
          });
          this.lightBoxVertexArrayObject = twgl.createVAOFromBufferInfo(gl, this.colorProgramInfo, this.lightBoxLinesBufferInfo);

        // Create a texture.
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // fill texture with 3x2 pixels
        const level = 0;
        const internalFormat = gl.LUMINANCE;
        const width = 8;
        const height = 8;
        const border = 0;
        const format = gl.LUMINANCE;
        const type = gl.UNSIGNED_BYTE;
        const data = new Uint8Array([
            255, 128, 255, 128, 255, 128, 255, 128, 
            128, 255, 128, 255, 128, 255, 128, 255,
            255, 128, 255, 128, 255, 128, 255, 128, 
            128, 255, 128, 255, 128, 255, 128, 255,
            255, 128, 255, 128, 255, 128, 255, 128, 
            128, 255, 128, 255, 128, 255, 128, 255,
            255, 128, 255, 128, 255, 128, 255, 128, 
            128, 255, 128, 255, 128, 255, 128, 255,
        ]);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);
        
        // set the filtering so we don't need mips and it's not filtered
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.material1Uniforms = {
            u_colorMult:             chroma.hsv(0, 0, 1).gl(),
            u_ambient:               [0.3, 0.3, 0.35, 1],
            u_diffuse:               texture,
            u_specular:              [1, 1, 1, 1],
            u_shininess:             50,
            u_specularFactor:        .7,
            u_recieveShadow:         false
        };

        this.material2Uniforms = {
            u_colorMult:             chroma.hsv(200, 1, 1).gl(),
            u_ambient:               [0.3, 0.3, 0.35, 1],
            u_diffuse:               texture,
            u_specular:              [1, 1, 1, 1],
            u_shininess:             5,
            u_specularFactor:        .25,
            u_recieveShadow:         true
        };

        // init the transformation properties
        this.origin = [0, 0, 0];
        this.translation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.rotation = [0, 0, 0];
        this.#updateModelMatrix();

        this.planeModelMatrix = m4.translation(0, -15, 0);

        // init global matrices
        this.projectionMatrix = m4.identity();
        this.viewMatrix = m4.identity();
        this.cameraMatrix = m4.identity();

        // init projection
        this.#updateProjectionMatrix();

        // init camera
        this.cameraRotationY = 0;
        this.#updateCameraMatrix();

        // light properties
        this.lightWorldPosition = [-100, 100, 0];

        // create the light matrix
        this.lightWorldMatrix = m4.lookAt(
            this.lightWorldPosition,
            [0, 0, 0],
            [0, -1, 0]
        );
        /*m4.scale(this.lightWorldMatrix, 0.5, 0.5, 1, this.lightWorldMatrix);
        this.lightProjectionMatrix = m4.perspective(
            this.degToRad(45),
            1,
            5,  // near
            180);*/
        const orthoSize = 30;
        this.lightProjectionMatrix = m4.orthographic(-orthoSize, orthoSize, -orthoSize, orthoSize, 110, 200);
        //m4.translate(this.lightProjectionMatrix, pw/2, ph/2, 0, this.lightProjectionMatrix);
        this.lightViewMatrix = m4.inverse(this.lightWorldMatrix);
        this.lightViewProjectionMatrix = m4.multiply(this.lightProjectionMatrix, this.lightViewMatrix);
        // get the inverse of the light projection to draw the light box model
        this.lightBoxModelMatrix = m4.multiply(m4.inverse(this.lightViewProjectionMatrix), m4.translate(m4.scaling(2, 2, 1), -.5, -.5, 0));


        // create the framebuffer to render the depth texture into
        this.lightDepthTexture = this.#createAndSetupTexture(this.gl);
        this.depthTextureSize = 512;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT32F, // internal format
            this.depthTextureSize,   // width
            this.depthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.FLOAT,           // type
            null);              // data

        this.depthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level


        this.uniformsThatAreTheSameForAllObjects = {
            u_projection:            this.projectionMatrix,
            u_view:                  this.viewMatrix,
            u_lightWorldPos:         this.lightWorldPosition,
            u_viewInverse:           this.cameraMatrix,
            u_lightColor:            [1, 1, 1, 1],
            u_lightMatrix:           this.lightViewProjectionMatrix,
            u_projectedTexture:      this.lightDepthTexture
        };

        /*this.uniformsThatAreTheSameForAllObjects = {
            u_projection:            this.lightProjectionMatrix,
            u_view:                  this.lightViewMatrix,
            u_lightWorldPos:         this.lightWorldPosition,
            u_viewInverse:           this.lightWorldMatrix,
            u_lightColor:            [1, 1, 1, 1],
            u_lightMatrix:           this.lightViewProjectionMatrix,
            u_projectedTexture:      this.lightDepthTexture
        };*/
    
        this.uniformsThatAreComputedForEachObject = {
            u_world:                 m4.identity(),
            u_worldInverseTranspose: m4.identity(),
        };


        this.resize();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
    }

    #setFramebuffer(gl, fbo, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); // all draw commands will affect the framebuffer
        gl.viewport(0, 0, width, height);
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

    #updateProjectionMatrix() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 1;
        const zFar = 2000;
        const fov = 75 * (Math.PI / 180);
        m4.perspective(fov, aspect, zNear, zFar, this.projectionMatrix);
    }

    #updateCameraMatrix() {
        // init the camera matrix
        m4.yRotation(this.cameraRotationY, this.cameraMatrix);
        m4.xRotate(this.cameraMatrix, this.degToRad(-45), this.cameraMatrix);
        m4.translate(this.cameraMatrix, 0, -10, 100, this.cameraMatrix);

        // init the view matrix
        m4.inverse(this.cameraMatrix, this.viewMatrix);
    }

    #updateModelMatrix() {
        this.modelMatrix = m4.translation(this.translation[0], this.translation[1], this.translation[2]);
        this.modelMatrix = m4.xRotate(this.modelMatrix, this.rotation[0]);
        this.modelMatrix = m4.yRotate(this.modelMatrix, this.rotation[1]);
        this.modelMatrix = m4.zRotate(this.modelMatrix, this.rotation[2]);
        this.modelMatrix = m4.scale(this.modelMatrix, this.scale[0], this.scale[1], this.scale[2]);
        this.modelMatrix = m4.translate(this.modelMatrix, -this.origin[0], -this.origin[1], -this.origin[2]);
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

            const objectYSlider = this.pane.addBlade({
                view: 'slider',
                label: 'sphere Y',
                min: 0,
                max: 20,
                value: 0,
            });

            objectYSlider.on('change', e => {
                this.translation[1] = e.value;
                this.#updateModelMatrix();
            });
        }
    }
}
