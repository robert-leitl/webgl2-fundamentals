
import { m4 } from '../math/m4';
import chroma from 'chroma-js';
import * as twgl from 'twgl.js';
import fragmentShaderSource from './shader/fragment.glsl';
import vertexShaderSource from './shader/vertex.glsl';
import skyboxFragmentShaderSource from './shader/skybox-fragment.glsl';
import skyboxVertexShaderSource from './shader/skybox-vertex.glsl';

export class WebGLSkybox {
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
        this.rotation[2] += (delta / 20000) * Math.PI * 2;
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

        /////////////// Draw object

        this.gl.bindVertexArray(this.objectVertexArrayObject);

        // Set the matrix uniform
        this.uniformsThatAreComputedForEachObject.u_world = this.modelMatrix;
        m4.transpose(m4.inverse(this.modelMatrix), this.uniformsThatAreComputedForEachObject.u_worldInverseTranspose);
        twgl.setUniforms(this.uniformSetters, this.uniformsThatAreComputedForEachObject);

        // Set the uniforms that are specific to the this object.
        twgl.setUniforms(this.uniformSetters, this.material1Uniforms);
        
        // Draw the geometry.
        this.gl.drawElements(this.gl.TRIANGLES, this.objectBuffers.numElements, this.gl.UNSIGNED_SHORT, 0);




        /////////////// Draw skybox

        // let our quad pass the depth test at 1.0
        this.gl.depthFunc(this.gl.LEQUAL);

        this.gl.useProgram(this.skyboxProgram);
        twgl.setUniforms(this.skyboxUniformSetters, { 
            u_cubeMap: this.cubeMapTexture,
            u_viewProjectionInverse: this.viewProjectionInverse
        });
        this.gl.bindVertexArray(this.skyboxVertexArrayObject);
        this.gl.drawElements(this.gl.TRIANGLES, this.skyboxBuffers.numElements, this.gl.UNSIGNED_SHORT, 0);
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

        // Tell the twgl to match position with a_position,
        // normal with a_normal etc..
        twgl.setAttributePrefix("a_");

        // setup GLSL program (compiles shader, links program, look up locations)
        this.program = twgl.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
        this.uniformSetters = twgl.createUniformSetters(gl, this.program);
        const attribSetters  = twgl.createAttributeSetters(gl, this.program);

        this.skyboxProgram = twgl.createProgramFromSources(gl, [skyboxVertexShaderSource, skyboxFragmentShaderSource]);
        this.skyboxUniformSetters = twgl.createUniformSetters(gl, this.skyboxProgram);
        const skyboxAttribSetters  = twgl.createAttributeSetters(gl, this.skyboxProgram);

        //////////////////////// Object VAO
        this.objectBuffers = twgl.primitives.createTorusBuffers(this.gl, 20, 10, 64, 64);
        const objectAttribs = {
            a_position: { buffer: this.objectBuffers.position, numComponents: 3, },
            a_normal:   { buffer: this.objectBuffers.normal,   numComponents: 3, },
            a_texcoord: { buffer: this.objectBuffers.texcoord, numComponents: 2, },
        };
        this.objectVertexArrayObject = twgl.createVAOAndSetAttributes(gl, attribSetters, objectAttribs, this.objectBuffers.indices);

        //////////////////////// Skybox VAO
        this.skyboxBuffers = twgl.primitives.createXYQuadBuffers(this.gl);
        const skyboxAttribs = {
            a_position: { buffer: this.skyboxBuffers.position, numComponents: 2 },
        };
        this.skyboxVertexArrayObject = twgl.createVAOAndSetAttributes(gl, skyboxAttribSetters, skyboxAttribs, this.skyboxBuffers.indices);


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

        this.#createCubeMap(this.gl);

        this.material1Uniforms = {
            u_colorMult:             chroma.hsv(0, 0, 1).gl(),
            u_ambient:               [0.4, 0.4, 0.41, 1],
            u_diffuse:               texture,
            u_specular:              [1, 1, 1, 1],
            u_shininess:             10,
            u_specularFactor:        .9
        };

        // init the transformation properties
        this.origin = [0, 0, 0];
        this.translation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.rotation = [0, 0, 0];
        this.#updateModelMatrix();

        // init global matrices
        this.projectionMatrix = m4.identity();
        this.viewMatrix = m4.identity();
        this.cameraMatrix = m4.identity();
        this.viewProjectionInverse = m4.identity();

        this.planeModelMatrix = m4.translation(0, -15, 0);

        // init projection
        this.#updateProjectionMatrix();

        // init camera
        this.cameraRotationY = 0;
        this.#updateCameraMatrix();

        this.uniformsThatAreTheSameForAllObjects = {
            u_projection:            this.projectionMatrix,
            u_view:                  this.viewMatrix,
            u_lightWorldPos:         [-100, 100, 100],
            u_viewInverse:           this.cameraMatrix,
            u_lightColor:            [1, 1, 1, 1],
            u_cubeMap:               this.cubeMapTexture
        };
    
        this.uniformsThatAreComputedForEachObject = {
            u_world:                 m4.identity(),
            u_worldInverseTranspose: m4.identity(),
        };

        this.resize();

        this.#initTweakpane();

        if (this.oninit) this.oninit(this);
    }

    #createCubeMap(gl) {
        this.envMapInfos = [
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: new URL('../assets/cubemap/posx.jpg', import.meta.url)
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: new URL('../assets/cubemap/negx.jpg', import.meta.url)
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: new URL('../assets/cubemap/posy.jpg', import.meta.url)
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: new URL('../assets/cubemap/negy.jpg', import.meta.url)
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: new URL('../assets/cubemap/posz.jpg', import.meta.url)
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: new URL('../assets/cubemap/negz.jpg', import.meta.url)
            }
        ];

        this.cubeMapTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeMapTexture);

        this.envMapInfos.forEach(info => {
            const {target, url} = info;

            const level = 0;
            const internalFormat = gl.RGBA;
            const size = 2048;
            const border = 0;
            const type = gl.UNSIGNED_BYTE;
            const format = gl.RGBA;

            gl.texImage2D(target, level, internalFormat, size, size, border, format, type, null);
            
            const faceImg = new Image();
            faceImg.src = url;
            faceImg.addEventListener('load', () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeMapTexture);
                gl.texImage2D(target, level, internalFormat, format, type, faceImg);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        });

        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }

    #updateProjectionMatrix() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 1;
        const zFar = 2000;
        const fov = 75 * (Math.PI / 180);
        m4.perspective(fov, aspect, zNear, zFar, this.projectionMatrix);
        this.#updateViewProjectionInverse();
    }

    #updateCameraMatrix() {
       // init the camera matrix
       m4.yRotation(this.cameraRotationY, this.cameraMatrix);
       //m4.xRotate(this.cameraMatrix, this.degToRad(-45), this.cameraMatrix);
       m4.translate(this.cameraMatrix, 0, 0, 100, this.cameraMatrix);

       // init the view matrix
       m4.inverse(this.cameraMatrix, this.viewMatrix);

       this.#updateViewProjectionInverse();
    }

    #updateViewProjectionInverse() {
        const viewMatrixRotationOnly = [...this.viewMatrix];
        // clear the translation
        viewMatrixRotationOnly[12] = 0;
        viewMatrixRotationOnly[13] = 0;
        viewMatrixRotationOnly[14] = 0;

        const viewProjectionMatrix = m4.multiply(this.projectionMatrix, viewMatrixRotationOnly);
        m4.inverse(viewProjectionMatrix, this.viewProjectionInverse);
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
