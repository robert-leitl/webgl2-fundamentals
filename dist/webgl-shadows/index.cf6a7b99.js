!function(e,t,i,r,o){var n="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},a="function"==typeof n.parcelRequire9b6a&&n.parcelRequire9b6a,s=a.cache||{},l="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function h(t,i){if(!s[t]){if(!e[t]){var r="function"==typeof n.parcelRequire9b6a&&n.parcelRequire9b6a;if(!i&&r)return r(t,!0);if(a)return a(t,!0);if(l&&"string"==typeof t)return l(t);var o=new Error("Cannot find module '"+t+"'");throw o.code="MODULE_NOT_FOUND",o}c.resolve=function(i){var r=e[t][1][i];return null!=r?r:i},c.cache={};var u=s[t]=new h.Module(t);e[t][0].call(u.exports,c,u,u.exports,this)}return s[t].exports;function c(e){var t=c.resolve(e);return!1===t?{}:h(t)}}h.isParcelRequire=!0,h.Module=function(e){this.id=e,this.bundle=h,this.exports={}},h.modules=e,h.cache=s,h.parent=a,h.register=function(t,i){e[t]=[function(e,t){t.exports=i},{}]},Object.defineProperty(h,"root",{get:function(){return n.parcelRequire9b6a}}),n.parcelRequire9b6a=h;for(var u=0;u<t.length;u++)h(t[u]);var c=h(i);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd&&define((function(){return c}))}({"1iED8":[function(e,t,i){e("tweakpane");var r,o,n=e("./webgl-shadows");window.addEventListener("load",(function(){var e,t=document.body.querySelector("#c");r=new n.WebGLShadows(t,e,(function(e){e.run()}))})),window.addEventListener("resize",(function(){r&&(o&&clearTimeout(o),o=setTimeout((function(){o=null,r.resize()}),300))}))},{tweakpane:"53J2X","./webgl-shadows":"4GGhe"}],"4GGhe":[function(e,t,i){var r=e("@parcel/transformer-js/src/esmodule-helpers.js");r.defineInteropFlag(i),r.export(i,"WebGLShadows",(function(){return M}));var o=e("@swc/helpers"),n=e("../math/m4"),a=e("chroma-js"),s=r.interopDefault(a),l=e("twgl.js"),h=e("./shader/fragment.glsl"),u=r.interopDefault(h),c=e("./shader/vertex.glsl"),d=r.interopDefault(c),f=new WeakSet,m=new WeakSet,v=new WeakSet,p=new WeakSet,_=new WeakSet,g=new WeakSet,T=new WeakSet,x=new WeakSet,E=new WeakSet,w=new WeakSet,M=function(){"use strict";function e(t,i){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;o.classCallCheck(this,e),o.defineProperty(this,"oninit",void 0),b.set(this,{writable:!0,value:0}),P.set(this,{writable:!0,value:!1}),f.add(this),m.add(this),v.add(this),p.add(this),_.add(this),g.add(this),T.add(this),x.add(this),E.add(this),w.add(this),this.canvas=t,this.pane=i,this.oninit=r,o.classPrivateMethodGet(this,p,A).call(this)}return o.createClass(e,[{key:"resize",value:function(){l.resizeCanvasToDisplaySize(this.gl.canvas),this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),o.classPrivateMethodGet(this,T,F).call(this)}},{key:"run",value:function(){this.lastFrameTime=performance.now(),o.classPrivateMethodGet(this,f,R).call(this,this.lastFrameTime)}},{key:"destroy",value:function(){o.classPrivateFieldSet(this,P,!0)}},{key:"degToRad",value:function(e){return e*Math.PI/180}},{key:"rand",value:function(e,t){return void 0===t&&(t=e,e=0),e+Math.random()*(t-e)}},{key:"randInt",value:function(e){return Math.floor(Math.random()*e)}}]),e}(),b=new WeakMap,P=new WeakMap;function R(e){var t=this,i=e-this.lastFrameTime;this.lastFrameTime=e,o.classPrivateFieldGet(this,P)||(this.gl.enable(this.gl.CULL_FACE),this.gl.enable(this.gl.DEPTH_TEST),o.classPrivateMethodGet(this,m,j).call(this),this.rotation[1]+=i/3e4*Math.PI*2,o.classPrivateMethodGet(this,E,U).call(this),requestAnimationFrame((function(e){return o.classPrivateMethodGet(t,f,R).call(t,e)})))}function j(){o.classPrivateMethodGet(this,_,I).call(this,this.gl,this.depthFramebuffer,this.depthTextureSize,this.depthTextureSize),this.gl.clearColor(0,0,0,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.useProgram(this.colorProgramInfo.program),l.setUniforms(this.colorProgramInfo,{u_color:[1,1,1,1],u_view:this.lightViewMatrix,u_projection:this.lightProjectionMatrix}),o.classPrivateMethodGet(this,v,C).call(this,this.colorProgramInfo),o.classPrivateMethodGet(this,_,I).call(this,this.gl,null,this.gl.canvas.width,this.gl.canvas.height),this.gl.clearColor(0,0,0,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.useProgram(this.programInfo.program),l.setUniforms(this.programInfo,this.uniformsThatAreTheSameForAllObjects),o.classPrivateMethodGet(this,v,C).call(this,this.programInfo),this.gl.useProgram(this.colorProgramInfo.program),this.gl.bindVertexArray(this.lightBoxVertexArrayObject),l.setUniforms(this.colorProgramInfo,{u_color:[1,1,1,1],u_view:this.viewMatrix,u_projection:this.projectionMatrix,u_world:this.lightBoxModelMatrix}),l.drawBufferInfo(this.gl,this.lightBoxLinesBufferInfo,this.gl.LINES)}function C(e){this.gl.bindVertexArray(this.planeVertexArrayObject),this.uniformsThatAreComputedForEachObject.u_world=this.planeModelMatrix,n.m4.transpose(n.m4.inverse(this.planeModelMatrix),this.uniformsThatAreComputedForEachObject.u_worldInverseTranspose),l.setUniforms(e,this.uniformsThatAreComputedForEachObject),l.setUniforms(e,this.material2Uniforms),this.gl.drawElements(this.gl.TRIANGLES,this.planeBuffers.numElements,this.gl.UNSIGNED_SHORT,0),this.gl.bindVertexArray(this.objectVertexArrayObject),this.uniformsThatAreComputedForEachObject.u_world=this.modelMatrix,n.m4.transpose(n.m4.inverse(this.modelMatrix),this.uniformsThatAreComputedForEachObject.u_worldInverseTranspose),l.setUniforms(e,this.uniformsThatAreComputedForEachObject),l.setUniforms(e,this.material1Uniforms),this.gl.drawElements(this.gl.TRIANGLES,this.objectBuffers.numElements,this.gl.UNSIGNED_SHORT,0)}function A(){this.gl=this.canvas.getContext("webgl2",{antialias:!0});var e=this.gl;if(!this.gl)throw new Error("No WebGL 2 context!");l.setAttributePrefix("a_");var t={attribLocations:{a_position:0,a_normal:1,a_texcoord:2,a_color:3}};this.programInfo=l.createProgramInfo(e,[d.default,u.default],t);var i=l.createAttributeSetters(e,this.programInfo.program);this.colorProgramInfo=l.createProgramInfo(e,["#version 300 es\nin vec4 a_position;\n\nuniform mat4 u_projection;\nuniform mat4 u_view;\nuniform mat4 u_world;\n\nvoid main() {\n  // Multiply the position by the matrices.\n  gl_Position = u_projection * u_view * u_world * a_position;\n}\n","#version 300 es\nprecision highp float;\n\nuniform vec4 u_color;\n\nout vec4 outColor;\n\nvoid main() {\n  outColor = u_color;\n}\n"],t),this.objectBuffers=l.primitives.createCubeBuffers(this.gl,20),this.objectBuffers=l.primitives.createSphereBuffers(this.gl,15,32,32);var r={a_position:{buffer:this.objectBuffers.position,numComponents:3},a_normal:{buffer:this.objectBuffers.normal,numComponents:3},a_texcoord:{buffer:this.objectBuffers.texcoord,numComponents:2}};this.objectVertexArrayObject=l.createVAOAndSetAttributes(e,i,r,this.objectBuffers.indices),this.planeBuffers=l.primitives.createPlaneBuffers(this.gl,100,100,1,1);var a={a_position:{buffer:this.planeBuffers.position,numComponents:3},a_normal:{buffer:this.planeBuffers.normal,numComponents:3},a_texcoord:{buffer:this.planeBuffers.texcoord,numComponents:2}};this.planeVertexArrayObject=l.createVAOAndSetAttributes(e,i,a,this.planeBuffers.indices),this.lightBoxLinesBufferInfo=l.createBufferInfoFromArrays(e,{position:[0,0,-1,1,0,-1,0,1,-1,1,1,-1,0,0,1,1,0,1,0,1,1,1,1,1],indices:[0,1,1,3,3,2,2,0,4,5,5,7,7,6,6,4,0,4,1,5,3,7,2,6]}),this.lightBoxVertexArrayObject=l.createVAOFromBufferInfo(e,this.colorProgramInfo,this.lightBoxLinesBufferInfo);var h=e.createTexture();e.bindTexture(e.TEXTURE_2D,h);var c=e.LUMINANCE,f=e.LUMINANCE,m=e.UNSIGNED_BYTE,v=new Uint8Array([255,128,255,128,255,128,255,128,128,255,128,255,128,255,128,255,255,128,255,128,255,128,255,128,128,255,128,255,128,255,128,255,255,128,255,128,255,128,255,128,128,255,128,255,128,255,128,255,255,128,255,128,255,128,255,128,128,255,128,255,128,255,128,255]);e.pixelStorei(e.UNPACK_ALIGNMENT,1),e.texImage2D(e.TEXTURE_2D,0,c,8,8,0,f,m,v),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),this.material1Uniforms={u_colorMult:s.default.hsv(0,0,1).gl(),u_ambient:[.3,.3,.35,1],u_diffuse:h,u_specular:[1,1,1,1],u_shininess:50,u_specularFactor:.7,u_recieveShadow:!1},this.material2Uniforms={u_colorMult:s.default.hsv(200,1,1).gl(),u_ambient:[.3,.3,.35,1],u_diffuse:h,u_specular:[1,1,1,1],u_shininess:5,u_specularFactor:.25,u_recieveShadow:!0},this.origin=[0,0,0],this.translation=[0,0,0],this.scale=[1,1,1],this.rotation=[0,0,0],o.classPrivateMethodGet(this,E,U).call(this),this.planeModelMatrix=n.m4.translation(0,-15,0),this.projectionMatrix=n.m4.identity(),this.viewMatrix=n.m4.identity(),this.cameraMatrix=n.m4.identity(),o.classPrivateMethodGet(this,T,F).call(this),this.cameraRotationY=0,o.classPrivateMethodGet(this,x,y).call(this),this.lightWorldPosition=[-100,100,0],this.lightWorldMatrix=n.m4.lookAt(this.lightWorldPosition,[0,0,0],[0,-1,0]);this.lightProjectionMatrix=n.m4.orthographic(-30,30,-30,30,110,200),this.lightViewMatrix=n.m4.inverse(this.lightWorldMatrix),this.lightViewProjectionMatrix=n.m4.multiply(this.lightProjectionMatrix,this.lightViewMatrix),this.lightBoxModelMatrix=n.m4.multiply(n.m4.inverse(this.lightViewProjectionMatrix),n.m4.translate(n.m4.scaling(2,2,1),-.5,-.5,0)),this.lightDepthTexture=o.classPrivateMethodGet(this,g,L).call(this,this.gl),this.depthTextureSize=512,e.bindTexture(e.TEXTURE_2D,this.lightDepthTexture),e.texImage2D(e.TEXTURE_2D,0,e.DEPTH_COMPONENT32F,this.depthTextureSize,this.depthTextureSize,0,e.DEPTH_COMPONENT,e.FLOAT,null),this.depthFramebuffer=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,this.depthFramebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,this.lightDepthTexture,0),this.uniformsThatAreTheSameForAllObjects={u_projection:this.projectionMatrix,u_view:this.viewMatrix,u_lightWorldPos:this.lightWorldPosition,u_viewInverse:this.cameraMatrix,u_lightColor:[1,1,1,1],u_lightMatrix:this.lightViewProjectionMatrix,u_projectedTexture:this.lightDepthTexture},this.uniformsThatAreComputedForEachObject={u_world:n.m4.identity(),u_worldInverseTranspose:n.m4.identity()},this.resize(),o.classPrivateMethodGet(this,w,S).call(this),this.oninit&&this.oninit(this)}function I(e,t,i,r){e.bindFramebuffer(e.FRAMEBUFFER,t),e.viewport(0,0,i,r)}function L(e){var t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),t}function F(){var e=this.gl.canvas.clientWidth/this.gl.canvas.clientHeight,t=Math.PI/180*75;n.m4.perspective(t,e,1,2e3,this.projectionMatrix)}function y(){n.m4.yRotation(this.cameraRotationY,this.cameraMatrix),n.m4.xRotate(this.cameraMatrix,this.degToRad(-45),this.cameraMatrix),n.m4.translate(this.cameraMatrix,0,-10,100,this.cameraMatrix),n.m4.inverse(this.cameraMatrix,this.viewMatrix)}function U(){this.modelMatrix=n.m4.translation(this.translation[0],this.translation[1],this.translation[2]),this.modelMatrix=n.m4.xRotate(this.modelMatrix,this.rotation[0]),this.modelMatrix=n.m4.yRotate(this.modelMatrix,this.rotation[1]),this.modelMatrix=n.m4.zRotate(this.modelMatrix,this.rotation[2]),this.modelMatrix=n.m4.scale(this.modelMatrix,this.scale[0],this.scale[1],this.scale[2]),this.modelMatrix=n.m4.translate(this.modelMatrix,-this.origin[0],-this.origin[1],-this.origin[2])}function S(){if(this.pane){var e=this;this.pane.addBlade({view:"slider",label:"camera RY",min:0,max:2*Math.PI,value:0}).on("change",(function(t){e.cameraRotationY=t.value,o.classPrivateMethodGet(e,x,y).call(e)})),this.pane.addBlade({view:"slider",label:"sphere Y",min:0,max:20,value:0}).on("change",(function(t){e.translation[1]=t.value,o.classPrivateMethodGet(e,E,U).call(e)}))}}},{"@swc/helpers":"2CIBz","../math/m4":"d0U9A","chroma-js":"lAOe9","twgl.js":"bpC7N","./shader/fragment.glsl":"lSVas","./shader/vertex.glsl":"2hn2b","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],lSVas:[function(e,t,i){t.exports="#version 300 es\nprecision highp float;\n#define GLSLIFY 1\n \nin vec4 v_position;\nin vec2 v_texCoord;\nin vec3 v_normal;\nin vec3 v_surfaceToLight;\nin vec3 v_surfaceToView;\nin vec4 v_projectedLightCoord;\n \nuniform vec4 u_lightColor;\nuniform vec4 u_ambient;\nuniform sampler2D u_diffuse;\nuniform sampler2D u_projectedTexture;\nuniform vec4 u_specular;\nuniform float u_shininess;\nuniform float u_specularFactor;\nuniform vec4 u_colorMult;\nuniform bool u_recieveShadow;\n \nout vec4 outColor;\n \nvec4 lit(float l ,float h, float m) {\n  return vec4(1.0,\n              max(l, 0.0),\n              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,\n              1.0);\n}\n \nvoid main() {\n    // divide by w to get the correct value\n    vec3 projectedLightCoord = v_projectedLightCoord.xyz / v_projectedLightCoord.w;\n    projectedLightCoord = projectedLightCoord * 0.5 + 0.5;\n    float currentDepth = projectedLightCoord.z - 0.005;\n    \n    bool inRange = \n        projectedLightCoord.x >= 0.0 &&\n        projectedLightCoord.x <= 1.0 &&\n        projectedLightCoord.y >= 0.0 &&\n        projectedLightCoord.y <= 1.0;\n    float projectedAmount = inRange ? 1.0 : 0.0;\n    float projectedDepth = texture(u_projectedTexture, projectedLightCoord.xy).r;\n    float shadowLight = (!u_recieveShadow || currentDepth <= projectedDepth) ? 1.0 : 0.;\n\n    vec4 diffuseColor = texture(u_diffuse, v_texCoord) * u_colorMult;\n    vec3 a_normal = normalize(v_normal);\n    vec3 surfaceToLight = normalize(v_surfaceToLight);\n    vec3 surfaceToView = normalize(v_surfaceToView);\n    vec3 halfVector = normalize(surfaceToLight + surfaceToView);\n    vec4 litR = lit(dot(a_normal, surfaceToLight), dot(a_normal, halfVector), u_shininess);\n    outColor = vec4((u_lightColor * (diffuseColor * litR.y * shadowLight + diffuseColor * u_ambient + u_specular * litR.z * u_specularFactor * shadowLight)).rgb, diffuseColor.a);\n}"},{}],"2hn2b":[function(e,t,i){t.exports="#version 300 es\n#define GLSLIFY 1\n \nuniform mat4 u_projection;\nuniform mat4 u_view;\nuniform vec3 u_lightWorldPos;\nuniform mat4 u_world;\nuniform mat4 u_viewInverse;\nuniform mat4 u_worldInverseTranspose;\nuniform mat4 u_lightMatrix;\n \nin vec4 a_position;\nin vec3 a_normal;\nin vec2 a_texcoord;\n \nout vec4 v_position;\nout vec2 v_texCoord;\nout vec3 v_normal;\nout vec3 v_surfaceToLight;\nout vec3 v_surfaceToView;\nout vec4 v_projectedLightCoord;\n \nvoid main() {\n    vec4 worldPosition = u_world * a_position;\n    v_texCoord = a_texcoord;\n    v_position = u_projection * u_view * worldPosition;\n    v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz;\n    v_surfaceToLight = u_lightWorldPos - worldPosition.xyz;\n    v_surfaceToView = (u_viewInverse[3] - worldPosition).xyz;\n    v_projectedLightCoord = u_lightMatrix * worldPosition;\n    gl_Position = v_position;\n}"},{}]},["1iED8"],"1iED8");
//# sourceMappingURL=index.cf6a7b99.js.map