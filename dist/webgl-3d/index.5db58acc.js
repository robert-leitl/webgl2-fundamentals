!function(t,e,i,r,a){var n="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},s="function"==typeof n.parcelRequire9b6a&&n.parcelRequire9b6a,o=s.cache||{},l="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function h(e,i){if(!o[e]){if(!t[e]){var r="function"==typeof n.parcelRequire9b6a&&n.parcelRequire9b6a;if(!i&&r)return r(e,!0);if(s)return s(e,!0);if(l&&"string"==typeof e)return l(e);var a=new Error("Cannot find module '"+e+"'");throw a.code="MODULE_NOT_FOUND",a}d.resolve=function(i){var r=t[e][1][i];return null!=r?r:i},d.cache={};var c=o[e]=new h.Module(e);t[e][0].call(c.exports,d,c,c.exports,this)}return o[e].exports;function d(t){var e=d.resolve(t);return!1===e?{}:h(e)}}h.isParcelRequire=!0,h.Module=function(t){this.id=t,this.bundle=h,this.exports={}},h.modules=t,h.cache=o,h.parent=s,h.register=function(e,i){t[e]=[function(t,e){e.exports=i},{}]},Object.defineProperty(h,"root",{get:function(){return n.parcelRequire9b6a}}),n.parcelRequire9b6a=h;for(var c=0;c<e.length;c++)h(e[c]);var d=h(i);"object"==typeof exports&&"undefined"!=typeof module?module.exports=d:"function"==typeof define&&define.amd&&define((function(){return d}))}({"6Fx79":[function(t,e,i){t("./helpers/bundle-manifest").register(JSON.parse('{"83Npk":"index.5db58acc.js","cJfsF":"f-texture.2ff25e20.png","9LU3i":"index.ba31ca7d.js","eRuGw":"index.3eb9ea76.js"}'))},{"./helpers/bundle-manifest":"gSiLw"}],gSiLw:[function(t,e,i){"use strict";var r={};e.exports.register=function(t){for(var e=Object.keys(t),i=0;i<e.length;i++)r[e[i]]=t[e[i]]},e.exports.resolve=function(t){var e=r[t];if(null==e)throw new Error("Could not resolve bundle with id "+t);return e}},{}],fz4mh:[function(t,e,i){var r,a,n=t("./webgl-3d"),s=t("tweakpane");window.addEventListener("load",(function(){var t,e=document.body.querySelector("#c");t=new s.Pane({title:"Settings"}),r=new n.WebGL3d(e,t,(function(t){t.run()}))})),window.addEventListener("resize",(function(){r&&(a&&clearTimeout(a),a=setTimeout((function(){a=null,r.resize()}),300))}))},{"./webgl-3d":"86xa1",tweakpane:"53J2X"}],"86xa1":[function(t,e,i){var r=t("@parcel/transformer-js/src/esmodule-helpers.js");r.defineInteropFlag(i),r.export(i,"WebGL3d",(function(){return b}));var a=t("@swc/helpers"),n=t("../math/m4"),s=t("./shader/fragment.glsl"),o=r.interopDefault(s),l=t("./shader/vertex.glsl"),h=r.interopDefault(l),c=new WeakSet,d=new WeakSet,u=new WeakSet,f=new WeakSet,g=new WeakSet,m=new WeakSet,v=new WeakSet,p=new WeakSet,x=new WeakSet,R=new WeakSet,w=new WeakSet,_=new WeakSet,E=new WeakSet,T=new WeakSet,A=new WeakSet,b=function(){"use strict";function e(i,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,s=this;a.classCallCheck(this,e),a.defineProperty(this,"oninit",void 0),M.set(this,{writable:!0,value:0}),P.set(this,{writable:!0,value:!1}),c.add(this),d.add(this),u.add(this),f.add(this),g.add(this),m.add(this),v.add(this),p.add(this),x.add(this),R.add(this),w.add(this),_.add(this),E.add(this),T.add(this),A.add(this),this.canvas=i,this.pane=r,this.oninit=n,this.image=new Image,this.image.src=new URL(t("52a888cceee12eb2")),this.image.onload=function(){a.classPrivateMethodGet(s,f,L).call(s)},a.classPrivateMethodGet(this,u,F).call(this)}return a.createClass(e,[{key:"resize",value:function(){a.classPrivateMethodGet(this,T,O).call(this,this.gl.canvas),this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),a.classPrivateMethodGet(this,m,G).call(this),this.viewProjectionMatrix=n.m4.multiply(this.projectionMatrix,this.viewMatrix)}},{key:"run",value:function(){this.lastFrameTime=performance.now(),a.classPrivateMethodGet(this,c,S).call(this,this.lastFrameTime)}},{key:"destroy",value:function(){a.classPrivateFieldSet(this,P,!0)}}]),e}(),M=new WeakMap,P=new WeakMap;function S(t){var e=this,i=t-this.lastFrameTime;this.lastFrameTime=t,a.classPrivateFieldGet(this,P)||(a.classPrivateMethodGet(this,d,y).call(this),this.gl.uniform1f(this.timeUniformLocation,a.classPrivateFieldGet(this,M)),a.classPrivateFieldSet(this,M,a.classPrivateFieldGet(this,M)+.01),this.rotation[1]+=i/5e3*Math.PI*2,a.classPrivateMethodGet(this,p,I).call(this),requestAnimationFrame((function(t){return a.classPrivateMethodGet(e,c,S).call(e,t)})))}function y(){this.gl.clearColor(0,0,0,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.bindVertexArray(this.vertexArrayObject);var t=n.m4.multiply(this.viewProjectionMatrix,this.modelMatrix);this.gl.uniformMatrix4fv(this.matrixUniformLocation,!1,t);var e=this.gl.TRIANGLES;this.gl.drawArrays(e,0,96)}function F(){if(this.gl=this.canvas.getContext("webgl2"),!this.gl)throw new Error("No WebGL 2 context!");this.vertexShader=a.classPrivateMethodGet(this,_,j).call(this,this.gl,this.gl.VERTEX_SHADER,h.default),this.fragmentShader=a.classPrivateMethodGet(this,_,j).call(this,this.gl,this.gl.FRAGMENT_SHADER,o.default),this.program=a.classPrivateMethodGet(this,E,C).call(this,this.gl,this.vertexShader,this.fragmentShader);var t=this.gl.getAttribLocation(this.program,"a_position"),e=this.gl.getAttribLocation(this.program,"a_color"),i=this.gl.getAttribLocation(this.program,"a_uv");this.timeUniformLocation=this.gl.getUniformLocation(this.program,"u_time"),this.matrixUniformLocation=this.gl.getUniformLocation(this.program,"u_matrix"),this.imageUniformLocation=this.gl.getUniformLocation(this.program,"u_image"),this.vertexArrayObject=this.gl.createVertexArray(),this.gl.bindVertexArray(this.vertexArrayObject);var r=this.gl.createBuffer();this.gl.enableVertexAttribArray(t),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,r),a.classPrivateMethodGet(this,R,B).call(this,this.gl),this.gl.vertexAttribPointer(t,3,this.gl.FLOAT,!1,0,0);var n=this.gl.createBuffer();this.gl.enableVertexAttribArray(e),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,n),a.classPrivateMethodGet(this,x,D).call(this,this.gl),this.gl.vertexAttribPointer(e,3,this.gl.FLOAT,!1,0,0);var s=this.gl.createBuffer();this.gl.enableVertexAttribArray(i),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,s),a.classPrivateMethodGet(this,w,W).call(this,this.gl),this.gl.vertexAttribPointer(i,2,this.gl.FLOAT,!1,0,0),this.imageTexture=a.classPrivateMethodGet(this,g,U).call(this,this.gl),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,1,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255])),this.gl.enable(this.gl.CULL_FACE),this.gl.enable(this.gl.DEPTH_TEST),this.origin=[0,0,0],this.translation=[0,0,0],this.scale=[1,1,1],this.rotation=[0,0,0],a.classPrivateMethodGet(this,p,I).call(this),a.classPrivateMethodGet(this,m,G).call(this),this.cameraRotationY=0,a.classPrivateMethodGet(this,v,k).call(this),this.resize(),a.classPrivateMethodGet(this,A,N).call(this),this.oninit&&this.oninit(this)}function L(){this.gl.bindTexture(this.gl.TEXTURE_2D,this.imageTexture),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this.image),this.gl.generateMipmap(this.gl.TEXTURE_2D)}function U(t){var e=t.createTexture();return t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),e}function G(){var t=this.gl.canvas.clientWidth/this.gl.canvas.clientHeight,e=Math.PI/180*75;this.projectionMatrix=n.m4.perspective(e,t,1,2e3)}function k(){this.cameraMatrix=n.m4.yRotation(this.cameraRotationY),this.cameraMatrix=n.m4.translate(this.cameraMatrix,0,0,400),this.viewMatrix=n.m4.inverse(this.cameraMatrix),this.viewProjectionMatrix=n.m4.multiply(this.projectionMatrix,this.viewMatrix)}function I(){this.modelMatrix=n.m4.translation(this.translation[0],this.translation[1],this.translation[2]),this.modelMatrix=n.m4.xRotate(this.modelMatrix,this.rotation[0]),this.modelMatrix=n.m4.yRotate(this.modelMatrix,this.rotation[1]),this.modelMatrix=n.m4.zRotate(this.modelMatrix,this.rotation[2]),this.modelMatrix=n.m4.scale(this.modelMatrix,this.scale[0],this.scale[1],this.scale[2]),this.modelMatrix=n.m4.translate(this.modelMatrix,-this.origin[0],-this.origin[1],-this.origin[2])}function D(t){for(var e=new Float32Array(288),i=0,r=0;r<16;r++)for(var n=[.5*Math.random(),0*Math.random(),.5*Math.random()+.5],s=0;s<6;s++)e.set(a.toConsumableArray(n),3*i),i++;t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW)}function B(t){for(var e=new Float32Array([0,0,0,0,150,0,30,0,0,0,150,0,30,150,0,30,0,0,30,0,0,30,30,0,100,0,0,30,30,0,100,30,0,100,0,0,30,60,0,30,90,0,67,60,0,30,90,0,67,90,0,67,60,0,0,0,30,30,0,30,0,150,30,0,150,30,30,0,30,30,150,30,30,0,30,100,0,30,30,30,30,30,30,30,100,0,30,100,30,30,30,60,30,67,60,30,30,90,30,30,90,30,67,60,30,67,90,30,0,0,0,100,0,0,100,0,30,0,0,0,100,0,30,0,0,30,100,0,0,100,30,0,100,30,30,100,0,0,100,30,30,100,0,30,30,30,0,30,30,30,100,30,30,30,30,0,100,30,30,100,30,0,30,30,0,30,60,30,30,30,30,30,30,0,30,60,0,30,60,30,30,60,0,67,60,30,30,60,30,30,60,0,67,60,0,67,60,30,67,60,0,67,90,30,67,60,30,67,60,0,67,90,0,67,90,30,30,90,0,30,90,30,67,90,30,30,90,0,67,90,30,67,90,0,30,90,0,30,150,30,30,90,30,30,90,0,30,150,0,30,150,30,0,150,0,0,150,30,30,150,30,0,150,0,30,150,30,30,150,0,0,0,0,0,0,30,0,150,30,0,0,0,0,150,30,0,150,0]),i=n.m4.translate(n.m4.xRotation(Math.PI),-50,-75,-15),r=0;r<e.length;r+=3){var a=n.m4.transformPoint(i,[e[r+0],e[r+1],e[r+2],1]);e[r+0]=a[0],e[r+1]=a[1],e[r+2]=a[2]}t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW)}function W(t){t.bufferData(t.ARRAY_BUFFER,new Float32Array([38/255,44/255,38/255,223/255,113/255,44/255,38/255,223/255,113/255,223/255,113/255,44/255,113/255,44/255,113/255,85/255,218/255,44/255,113/255,85/255,218/255,85/255,218/255,44/255,113/255,112/255,113/255,151/255,203/255,112/255,113/255,151/255,203/255,151/255,203/255,112/255,38/255,44/255,113/255,44/255,38/255,223/255,38/255,223/255,113/255,44/255,113/255,223/255,113/255,44/255,218/255,44/255,113/255,85/255,113/255,85/255,218/255,44/255,218/255,85/255,113/255,112/255,203/255,112/255,113/255,151/255,113/255,151/255,203/255,112/255,203/255,151/255,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0]),t.STATIC_DRAW)}function j(t,e,i){var r=t.createShader(e);if(t.shaderSource(r,i),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS))return r;console.error(t.getShaderInfoLog(r)),t.deleteShader(r)}function C(t,e,i){var r=t.createProgram();if(t.attachShader(r,e),t.attachShader(r,i),t.linkProgram(r),t.getProgramParameter(r,t.LINK_STATUS))return r;console.error(t.getProgramInfoLog(r)),t.deleteProgram(r)}function O(t){var e=t.clientWidth,i=t.clientHeight,r=t.width!==e||t.height!==i;return r&&(t.width=e,t.height=i),r}function N(){if(this.pane){var t=this;this.pane.addBlade({view:"slider",label:"camera RY",min:0,max:2*Math.PI,value:0}).on("change",(function(e){t.cameraRotationY=e.value,a.classPrivateMethodGet(t,v,k).call(t)}))}}},{"@swc/helpers":"2CIBz","../math/m4":"d0U9A","./shader/fragment.glsl":"3Li5R","./shader/vertex.glsl":"8IKwy","52a888cceee12eb2":"7YeSm","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],"3Li5R":[function(t,e,i){e.exports='#version 300 es\n\n// fragment shaders don\'t have a default precision so we need\n// to pick one. highp is a good default. It means "high precision"\nprecision highp float;\n#define GLSLIFY 1\n\nuniform float u_time;\nuniform sampler2D u_image;\n\nin vec3 v_color;\nin vec2 v_uv;\n\nout vec4 outColor;\n\nvoid main() {\n    outColor = texture(u_image, v_uv);\n}\n'},{}],"8IKwy":[function(t,e,i){e.exports="#version 300 es\n#define GLSLIFY 1\n\nin vec4 a_position;\nin vec3 a_color;\nin vec2 a_uv;\n\nuniform mat4 u_matrix;\n\nout vec3 v_color;\nout vec2 v_uv;\n\nvoid main() {\n    v_color = a_color;\n    v_uv = a_uv;\n    gl_Position = u_matrix * a_position;\n}\n"},{}],"7YeSm":[function(t,e,i){e.exports=t("./helpers/bundle-url").getBundleURL("83Npk")+"../"+t("./helpers/bundle-manifest").resolve("cJfsF")},{"./helpers/bundle-url":"a2ypy","./helpers/bundle-manifest":"gSiLw"}],a2ypy:[function(t,e,i){"use strict";var r={};function a(t){return(""+t).replace(/^((?:https?|file|ftp):\/\/.+)\/[^/]+$/,"$1")+"/"}i.getBundleURL=function(t){var e=r[t];return e||(e=function(){try{throw new Error}catch(e){var t=(""+e.stack).match(/(https?|file|ftp):\/\/[^)\n]+/g);if(t)return a(t[2])}return"/"}(),r[t]=e),e},i.getBaseURL=a,i.getOrigin=function(t){var e=(""+t).match(/(https?|file|ftp):\/\/[^/]+/);if(!e)throw new Error("Origin not found");return e[0]}},{}]},["6Fx79","fz4mh"],"fz4mh");
//# sourceMappingURL=index.5db58acc.js.map
