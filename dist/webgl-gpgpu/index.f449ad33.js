!function(t,e,i,r,a){var s="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},n="function"==typeof s.parcelRequire9b6a&&s.parcelRequire9b6a,o=n.cache||{},l="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function h(e,i){if(!o[e]){if(!t[e]){var r="function"==typeof s.parcelRequire9b6a&&s.parcelRequire9b6a;if(!i&&r)return r(e,!0);if(n)return n(e,!0);if(l&&"string"==typeof e)return l(e);var a=new Error("Cannot find module '"+e+"'");throw a.code="MODULE_NOT_FOUND",a}d.resolve=function(i){var r=t[e][1][i];return null!=r?r:i},d.cache={};var c=o[e]=new h.Module(e);t[e][0].call(c.exports,d,c,c.exports,this)}return o[e].exports;function d(t){var e=d.resolve(t);return!1===e?{}:h(e)}}h.isParcelRequire=!0,h.Module=function(t){this.id=t,this.bundle=h,this.exports={}},h.modules=t,h.cache=o,h.parent=n,h.register=function(e,i){t[e]=[function(t,e){e.exports=i},{}]},Object.defineProperty(h,"root",{get:function(){return s.parcelRequire9b6a}}),s.parcelRequire9b6a=h;for(var c=0;c<e.length;c++)h(e[c]);var d=h(i);"object"==typeof exports&&"undefined"!=typeof module?module.exports=d:"function"==typeof define&&define.amd&&define((function(){return d}))}({"9lIGG":[function(t,e,i){t("tweakpane");var r,a,s=t("./webgl-gpgpu");window.addEventListener("load",(function(){var t,e=document.body.querySelector("#c");r=new s.WebGLGPGPU(e,t,(function(t){t.run()}))})),window.addEventListener("resize",(function(){r&&(a&&clearTimeout(a),a=setTimeout((function(){a=null,r.resize()}),300))}))},{tweakpane:"53J2X","./webgl-gpgpu":"cQbnF"}],cQbnF:[function(t,e,i){var r=t("@parcel/transformer-js/src/esmodule-helpers.js");r.defineInteropFlag(i),r.export(i,"WebGLGPGPU",(function(){return R}));var a=t("@swc/helpers"),s=t("twgl.js"),n=(t("../math/m4"),t("./shader/compute-fragment.glsl")),o=r.interopDefault(n),l=t("./shader/compute-vertex.glsl"),h=r.interopDefault(l),c=t("./shader/draw-fragment.glsl"),d=r.interopDefault(c),u=t("./shader/draw-vertex.glsl"),f=r.interopDefault(u),m=new WeakSet,g=new WeakSet,v=new WeakSet,p=new WeakSet,w=new WeakSet,_=new WeakSet,P=new WeakSet,A=new WeakSet,b=new WeakSet,M=new WeakSet,R=function(){"use strict";function t(e,i){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;a.classCallCheck(this,t),a.defineProperty(this,"oninit",void 0),S.set(this,{writable:!0,value:0}),F.set(this,{writable:!0,value:0}),x.set(this,{writable:!0,value:!1}),a.defineProperty(this,"camera",{rotation:0,position:[0,0,100],matrix:s.m4.identity()}),m.add(this),g.add(this),v.add(this),p.add(this),w.add(this),_.add(this),P.add(this),A.add(this),b.add(this),M.add(this),this.canvas=e,this.pane=i,this.oninit=r,a.classPrivateMethodGet(this,g,y).call(this)}return a.createClass(t,[{key:"resize",value:function(){s.resizeCanvasToDisplaySize(this.gl.canvas),this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),a.classPrivateMethodGet(this,b,U).call(this)}},{key:"run",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=this;a.classPrivateFieldSet(this,F,t-a.classPrivateFieldGet(this,S)),a.classPrivateFieldSet(this,S,t),a.classPrivateFieldGet(this,x)||(this.computeUniforms.u_deltaTime=a.classPrivateFieldGet(this,F),a.classPrivateMethodGet(this,m,T).call(this),requestAnimationFrame((function(t){return e.run(t)})))}},{key:"destroy",value:function(){a.classPrivateFieldSet(this,x,!0)}}]),t}(),S=new WeakMap,F=new WeakMap,x=new WeakMap;function T(){this.gl.clearColor(0,0,0,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.disable(this.gl.DEPTH_TEST),this.gl.disable(this.gl.CULL_FACE),this.gl.enable(this.gl.BLEND),this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.DST_ALPHA),this.gl.enable(this.gl.RASTERIZER_DISCARD),this.gl.useProgram(this.computeProgram),this.gl.bindVertexArray(this.currentRenderState.computeVAO),this.gl.uniform1f(this.computeLocations.u_deltaTime,this.computeUniforms.u_deltaTime),this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK,this.currentRenderState.transformFeedback),this.gl.beginTransformFeedback(this.gl.POINTS),this.gl.drawArrays(this.gl.POINTS,0,this.NUM_PARTICLES),this.gl.endTransformFeedback(),this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK,null),this.gl.disable(this.gl.RASTERIZER_DISCARD),this.gl.useProgram(this.drawProgram),this.gl.bindVertexArray(this.currentRenderState.drawVAO),this.gl.uniformMatrix4fv(this.drawLocations.u_worldMatrix,!1,this.drawUniforms.u_worldMatrix),this.gl.uniformMatrix4fv(this.drawLocations.u_viewMatrix,!1,this.drawUniforms.u_viewMatrix),this.gl.uniformMatrix4fv(this.drawLocations.u_projectionMatrix,!1,this.drawUniforms.u_projectionMatrix),this.gl.drawArrays(this.gl.POINTS,0,this.NUM_PARTICLES);var t=this.currentRenderState;this.currentRenderState=this.nextRenderState,this.nextRenderState=t}function y(){if(this.gl=this.canvas.getContext("webgl2",{antialias:!0}),!this.gl)throw new Error("No WebGL 2 context!");this.computeProgram=a.classPrivateMethodGet(this,P,B).call(this,this.gl,[h.default,o.default],["t_newPosition"]),this.drawProgram=a.classPrivateMethodGet(this,P,B).call(this,this.gl,[f.default,d.default]),this.computeLocations={a_oldPosition:this.gl.getAttribLocation(this.computeProgram,"a_oldPosition"),a_velocity:this.gl.getAttribLocation(this.computeProgram,"a_velocity"),u_deltaTime:this.gl.getUniformLocation(this.computeProgram,"u_deltaTime")},this.drawLocations={a_position:this.gl.getAttribLocation(this.drawProgram,"a_position"),u_worldMatrix:this.gl.getUniformLocation(this.drawProgram,"u_worldMatrix"),u_viewMatrix:this.gl.getUniformLocation(this.drawProgram,"u_viewMatrix"),u_projectionMatrix:this.gl.getUniformLocation(this.drawProgram,"u_projectionMatrix")},this.NUM_PARTICLES=1e4;var t=new Float32Array(Array(this.NUM_PARTICLES).fill(0).map((function(t){return Array(3).fill(0).map((function(t){return Math.random()}))})).flat()),e=new Float32Array(Array(this.NUM_PARTICLES).fill(0).map((function(t){return Array(3).fill(0).map((function(t){return 1e-4*(2*Math.random()-1)}))})).flat());this.position1Buffer=a.classPrivateMethodGet(this,w,G).call(this,this.gl,t,this.gl.DYNAMIC_DRAW),this.position2Buffer=a.classPrivateMethodGet(this,w,G).call(this,this.gl,t,this.gl.DYNAMIC_DRAW),this.velocitiesBuffer=a.classPrivateMethodGet(this,w,G).call(this,this.gl,e,this.gl.STATIC_DRAW),this.compute1VAO=a.classPrivateMethodGet(this,p,E).call(this,this.gl,[[this.position1Buffer,this.computeLocations.a_oldPosition],[this.velocitiesBuffer,this.computeLocations.a_velocity]]),this.compute2VAO=a.classPrivateMethodGet(this,p,E).call(this,this.gl,[[this.position2Buffer,this.computeLocations.a_oldPosition],[this.velocitiesBuffer,this.computeLocations.a_velocity]]),this.draw1VAO=a.classPrivateMethodGet(this,p,E).call(this,this.gl,[[this.position1Buffer,this.drawLocations.a_position]]),this.draw2VAO=a.classPrivateMethodGet(this,p,E).call(this,this.gl,[[this.position2Buffer,this.drawLocations.a_position]]),this.transformFeedback1=a.classPrivateMethodGet(this,v,L).call(this,this.gl,this.position1Buffer),this.transformFeedback2=a.classPrivateMethodGet(this,v,L).call(this,this.gl,this.position2Buffer),this.computeUniforms={u_deltaTime:0},this.drawUniforms={u_worldMatrix:s.m4.translate(s.m4.scaling([100,100,100]),[-.5,-.5,-.5]),u_viewMatrix:s.m4.identity(),u_projectionMatrix:s.m4.identity()},this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.TRANSFORM_FEEDBACK_BUFFER,null),this.currentRenderState={computeVAO:this.compute1VAO,transformFeedback:this.transformFeedback2,drawVAO:this.draw2VAO},this.nextRenderState={computeVAO:this.compute2VAO,transformFeedback:this.transformFeedback1,drawVAO:this.draw1VAO},this.resize(),a.classPrivateMethodGet(this,A,I).call(this),a.classPrivateMethodGet(this,b,U).call(this),a.classPrivateMethodGet(this,M,C).call(this),this.oninit&&this.oninit(this)}function L(t,e){var i=t.createTransformFeedback();return t.bindTransformFeedback(t.TRANSFORM_FEEDBACK,i),t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER,0,e),i}function E(t,e){var i=t.createVertexArray();t.bindVertexArray(i);var r=!0,s=!1,n=void 0;try{for(var o,l=e[Symbol.iterator]();!(r=(o=l.next()).done);r=!0){var h=a.slicedToArray(o.value,2),c=h[0],d=h[1];t.bindBuffer(t.ARRAY_BUFFER,c),t.enableVertexAttribArray(d),t.vertexAttribPointer(d,3,t.FLOAT,!1,0,0)}}catch(t){s=!0,n=t}finally{try{r||null==l.return||l.return()}finally{if(s)throw n}}return i}function G(t,e,i){var r=t.createBuffer();return t.bindBuffer(t.ARRAY_BUFFER,r),t.bufferData(t.ARRAY_BUFFER,e,i),r}function k(t,e,i){var r=t.createShader(e);if(t.shaderSource(r,i),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS))return r;console.error(t.getShaderInfoLog(r)),t.deleteShader(r)}function B(t,e,i){var r=this,s=t.createProgram();if([t.VERTEX_SHADER,t.FRAGMENT_SHADER].forEach((function(i,n){var o=a.classPrivateMethodGet(r,_,k).call(r,t,i,e[n]);t.attachShader(s,o)})),i&&t.transformFeedbackVaryings(s,i,t.SEPARATE_ATTRIBS),t.linkProgram(s),t.getProgramParameter(s,t.LINK_STATUS))return s;console.error(t.getProgramInfoLog(s)),t.deleteProgram(s)}function I(){s.m4.lookAt(this.camera.position,[0,0,0],[0,1,0],this.camera.matrix),s.m4.inverse(this.camera.matrix,this.drawUniforms.u_viewMatrix)}function U(){var t=this.gl.canvas.clientWidth/this.gl.canvas.clientHeight;s.m4.perspective(Math.PI/4,t,50,150,this.drawUniforms.u_projectionMatrix)}function C(){if(this.pane){var t=this;this.pane.addBlade({view:"slider",label:"c.y",min:-100,max:100,value:this.camera.position[1]}).on("change",(function(e){t.camera.position[1]=e.value,a.classPrivateMethodGet(t,A,I).call(t)})),this.pane.addBlade({view:"slider",label:"c.x",min:-100,max:100,value:this.camera.position[0]}).on("change",(function(e){t.camera.position[0]=e.value,a.classPrivateMethodGet(t,A,I).call(t)}))}}},{"@swc/helpers":"2CIBz","twgl.js":"bpC7N","../math/m4":"d0U9A","./shader/compute-fragment.glsl":"dWzwI","./shader/compute-vertex.glsl":"9biZv","./shader/draw-fragment.glsl":"1yANl","./shader/draw-vertex.glsl":"bAvPf","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],dWzwI:[function(t,e,i){e.exports="#version 300 es\n\nprecision highp float;\n#define GLSLIFY 1\n\nvoid main() {}\n"},{}],"9biZv":[function(t,e,i){e.exports="#version 300 es\n#define GLSLIFY 1\n\nuniform float u_deltaTime;\n\nin vec3 a_oldPosition;\nin vec3 a_velocity;\n\nout vec3 t_newPosition;\n\nvoid main() {\n    t_newPosition = a_oldPosition + a_velocity * u_deltaTime;\n    t_newPosition = mod(t_newPosition, vec3(1., 1., 1.));\n}\n"},{}],"1yANl":[function(t,e,i){e.exports="#version 300 es\n\nprecision highp float;\n#define GLSLIFY 1\n\nout vec4 outColor;\n\nin float v_size;\n\nvoid main() {\n    vec2 c = gl_PointCoord * 2. - 1.;\n    float mask = 1. - smoothstep(0.7, 0.9, length(c));\n    outColor = vec4(vec3(v_size) * mask, mask);\n}\n"},{}],bAvPf:[function(t,e,i){e.exports="#version 300 es\n#define GLSLIFY 1\n\nuniform mat4 u_worldMatrix;\nuniform mat4 u_viewMatrix;\nuniform mat4 u_projectionMatrix;\n\nin vec3 a_position;\n\nout float v_size;\n\nvoid main() {\n    vec4 worldPosition = u_worldMatrix * vec4(a_position, 1.);\n    vec4 viewPosition = u_viewMatrix * worldPosition;\n    gl_Position = u_projectionMatrix * viewPosition;\n    float size = 1. - ((gl_Position.z / gl_Position.w) * .5 + .5);\n    gl_PointSize = size * 20.;\n    v_size = size;\n}\n"},{}]},["9lIGG"],"9lIGG");
//# sourceMappingURL=index.f449ad33.js.map