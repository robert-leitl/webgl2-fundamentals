
import { m4 } from '../math/m4';
import chroma from 'chroma-js';
import * as twgl from 'twgl.js';
import fragmentShaderSource from './shader/fragment.glsl';
import vertexShaderSource from './shader/vertex.glsl';

export class WebGLTWGL {
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

        // enable backface culling
        this.gl.enable(this.gl.CULL_FACE);
        // enable the z-depth tests to discard pixels occluded by other pixels
        this.gl.enable(this.gl.DEPTH_TEST);

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

        // Set the uniforms that are the same for all objects.
        twgl.setUniforms(this.uniformSetters, this.uniformsThatAreTheSameForAllObjects);

        /////////////// Draw Plane

        this.gl.bindVertexArray(this.planeVertexArrayObject);

        // Set the matrix uniform
        this.uniformsThatAreComputedForEachObject.u_world = this.planeModelMatrix;
        this.uniformsThatAreComputedForEachObject.u_worldViewProjection = m4.multiply(this.viewProjectionMatrix, this.planeModelMatrix);
        m4.transpose(m4.inverse(this.planeModelMatrix), this.uniformsThatAreComputedForEachObject.u_worldInverseTranspose);
        twgl.setUniforms(this.uniformSetters, this.uniformsThatAreComputedForEachObject);

        // Set the uniforms that are specific to the this object.
        twgl.setUniforms(this.uniformSetters, this.material2Uniforms);
        
        // Draw the geometry.
        this.gl.drawElements(this.gl.TRIANGLES, this.planeBuffers.numElements, this.gl.UNSIGNED_SHORT, 0);

        /////////////// Draw object

        this.gl.bindVertexArray(this.objectVertexArrayObject);

        // Set the matrix uniform
        this.uniformsThatAreComputedForEachObject.u_world = this.modelMatrix;
        this.uniformsThatAreComputedForEachObject.u_worldViewProjection = m4.multiply(this.viewProjectionMatrix, this.modelMatrix);
        m4.transpose(m4.inverse(this.modelMatrix), this.uniformsThatAreComputedForEachObject.u_worldInverseTranspose);
        twgl.setUniforms(this.uniformSetters, this.uniformsThatAreComputedForEachObject);

        // Set the uniforms that are specific to the this object.
        twgl.setUniforms(this.uniformSetters, this.material1Uniforms);
        
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
        this.gl = this.canvas.getContext('webgl2');
        const gl = this.gl;

        if (!this.gl) {
            throw new Error('No WebGL 2 context!')
        }

        // setup GLSL program
        this.program = twgl.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
        this.uniformSetters = twgl.createUniformSetters(gl, this.program);
        const attribSetters  = twgl.createAttributeSetters(gl, this.program);

        //////////////////////// Object VAO
        this.objectBuffers = twgl.primitives.createCubeBuffers(this.gl, 20);
        this.objectBuffers = twgl.primitives.createSphereBuffers(this.gl, 15, 32, 32);
        const objectAttribs = {
            a_position: { buffer: this.objectBuffers.position, numComponents: 3, },
            a_normal:   { buffer: this.objectBuffers.normal,   numComponents: 3, },
            a_texcoord: { buffer: this.objectBuffers.texcoord, numComponents: 2, },
        };
        this.objectVertexArrayObject = twgl.createVAOAndSetAttributes(gl, attribSetters, objectAttribs, this.objectBuffers.indices);

        //////////////////////// object VAO
        this.planeBuffers = twgl.primitives.createPlaneBuffers(this.gl, 100, 100, 1, 1);
        const planeAttribs = {
            a_position: { buffer: this.planeBuffers.position, numComponents: 3, },
            a_normal:   { buffer: this.planeBuffers.normal,   numComponents: 3, },
            a_texcoord: { buffer: this.planeBuffers.texcoord, numComponents: 2, },
        };
        this.planeVertexArrayObject = twgl.createVAOAndSetAttributes(gl, attribSetters, planeAttribs, this.planeBuffers.indices);

        // Create a texture.
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // fill texture with 3x2 pixels
        const level = 0;
        const internalFormat = gl.LUMINANCE;
        const width = 2;
        const height = 2;
        const border = 0;
        const format = gl.LUMINANCE;
        const type = gl.UNSIGNED_BYTE;
        const data = new Uint8Array([
            255, 128,
            128, 255,
        ]);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);
        
        // set the filtering so we don't need mips and it's not filtered
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.material1Uniforms = {
            u_colorMult:             chroma.hsv(0, 1, 1).gl(),
            u_diffuse:               texture,
            u_specular:              [1, 1, 1, 1],
            u_shininess:             50,
            u_specularFactor:        .7,
        };

        this.material2Uniforms = {
            u_colorMult:             chroma.hsv(200, 1, 1).gl(),
            u_diffuse:               texture,
            u_specular:              [1, 1, 1, 1],
            u_shininess:             5,
            u_specularFactor:        .25,
        };

        // init the transformation properties
        this.origin = [0, 0, 0];
        this.translation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.rotation = [0, 0, 0];
        this.#updateModelMatrix();

        this.planeModelMatrix = m4.translation(0, -15, 0);

        // init projection
        this.#updateProjectionMatrix();

        // init camera
        this.cameraRotationY = 0;
        this.#updateCameraMatrix();

        this.uniformsThatAreTheSameForAllObjects = {
            u_lightWorldPos:         [-50, 30, 100],
            u_viewInverse:           this.cameraMatrix,
            u_lightColor:            [1, 1, 1, 1],
        };
    
        this.uniformsThatAreComputedForEachObject = {
            u_worldViewProjection:   m4.identity(),
            u_world:                 m4.identity(),
            u_worldInverseTranspose: m4.identity(),
        };

        this.resize();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
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
        this.cameraMatrix = m4.translate(this.cameraMatrix, 0, 0, 50);

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
