!function(e,t,i,r,n){var a="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},s="function"==typeof a.parcelRequire9b6a&&a.parcelRequire9b6a,o=s.cache||{},l="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function h(t,i){if(!o[t]){if(!e[t]){var r="function"==typeof a.parcelRequire9b6a&&a.parcelRequire9b6a;if(!i&&r)return r(t,!0);if(s)return s(t,!0);if(l&&"string"==typeof t)return l(t);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}f.resolve=function(i){var r=e[t][1][i];return null!=r?r:i},f.cache={};var u=o[t]=new h.Module(t);e[t][0].call(u.exports,f,u,u.exports,this)}return o[t].exports;function f(e){var t=f.resolve(e);return!1===t?{}:h(t)}}h.isParcelRequire=!0,h.Module=function(e){this.id=e,this.bundle=h,this.exports={}},h.modules=e,h.cache=o,h.parent=s,h.register=function(t,i){e[t]=[function(e,t){t.exports=i},{}]},Object.defineProperty(h,"root",{get:function(){return a.parcelRequire9b6a}}),a.parcelRequire9b6a=h;for(var u=0;u<t.length;u++)h(t[u]);var f=h(i);"object"==typeof exports&&"undefined"!=typeof module?module.exports=f:"function"==typeof define&&define.amd&&define((function(){return f}))}({e5PEu:[function(e,t,i){e("./helpers/bundle-manifest").register(JSON.parse('{"4AYAf":"index.5a507de5.js","d80ZC":"image.ddd0319d.jpeg","9LU3i":"index.ba31ca7d.js"}'))},{"./helpers/bundle-manifest":"gSiLw"}],gSiLw:[function(e,t,i){"use strict";var r={};t.exports.register=function(e){for(var t=Object.keys(e),i=0;i<t.length;i++)r[t[i]]=e[t[i]]},t.exports.resolve=function(e){var t=r[e];if(null==t)throw new Error("Could not resolve bundle with id "+e);return t}},{}],k9Dy2:[function(e,t,i){var r,n,a=e("tweakpane"),s=e("./webgl-image-processing");window.addEventListener("load",(function(){var e,t=document.body.querySelector("#c");e=new a.Pane({title:"Settings"}),r=new s.WebglImageProcessing(t,e,(function(e){e.run()}))})),window.addEventListener("resize",(function(){r&&(n&&clearTimeout(n),n=setTimeout((function(){n=null,r.resize()}),300))}))},{tweakpane:"53J2X","./webgl-image-processing":"bolzb"}],bolzb:[function(e,t,i){var r=e("@parcel/transformer-js/src/esmodule-helpers.js");r.defineInteropFlag(i),r.export(i,"WebglImageProcessing",(function(){return E}));var n=e("@swc/helpers"),a=e("./shader/fragment.glsl"),s=r.interopDefault(a),o=e("./shader/vertex.glsl"),l=r.interopDefault(o),h=new WeakSet,u=new WeakSet,f=new WeakSet,c=new WeakSet,g=new WeakSet,d=new WeakSet,v=new WeakSet,m=new WeakSet,p=new WeakSet,_=new WeakSet,T=new WeakSet,E=function(){"use strict";function t(i,r){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,s=this;n.classCallCheck(this,t),n.defineProperty(this,"oninit",void 0),n.defineProperty(this,"kernels",{normal:[0,0,0,0,1,0,0,0,0],blur:[.045,.122,.045,.122,.332,.122,.045,.122,.045],unsharpen:[-1,-1,-1,-1,9,-1,-1,-1,-1],emboss:[-2,-1,0,-1,1,1,0,1,2]}),n.defineProperty(this,"effectsToApply",{blur:!1,emboss:!1,unsharpen:!1}),b.set(this,{writable:!0,value:0}),x.set(this,{writable:!0,value:!1}),h.add(this),u.add(this),f.add(this),c.add(this),g.add(this),d.add(this),v.add(this),m.add(this),p.add(this),_.add(this),T.add(this),this.canvas=i,this.pane=r,this.oninit=a,this.image=new Image,this.image.src=new URL(e("592f3048f75e3dc8")),this.image.onload=function(){n.classPrivateMethodGet(s,u,A).call(s)}}return n.createClass(t,[{key:"resize",value:function(){n.classPrivateMethodGet(this,p,L).call(this,this.gl.canvas),this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height)}},{key:"run",value:function(){var e=this;n.classPrivateFieldGet(this,x)||(n.classPrivateMethodGet(this,h,R).call(this),this.gl.uniform4f(this.colorUniformLocation,1,0,0,1),this.gl.uniform1f(this.timeUniformLocation,n.classPrivateFieldGet(this,b)),n.classPrivateFieldSet(this,b,n.classPrivateFieldGet(this,b)+.01),requestAnimationFrame((function(){return e.run()})))}},{key:"destroy",value:function(){n.classPrivateFieldSet(this,x,!0)}}]),t}(),b=new WeakMap,x=new WeakMap;function R(){this.gl.clearColor(0,0,0,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT),n.classPrivateMethodGet(this,f,w).call(this,this.gl)}function A(){if(this.gl=this.canvas.getContext("webgl2"),!this.gl)throw new Error("No WebGL 2 context!");this.vertexShader=n.classPrivateMethodGet(this,v,U).call(this,this.gl,this.gl.VERTEX_SHADER,l.default),this.fragmentShader=n.classPrivateMethodGet(this,v,U).call(this,this.gl,this.gl.FRAGMENT_SHADER,s.default),this.program=n.classPrivateMethodGet(this,m,y).call(this,this.gl,this.vertexShader,this.fragmentShader);var e=this.gl.getAttribLocation(this.program,"a_position"),t=this.gl.getAttribLocation(this.program,"a_uv");this.colorUniformLocation=this.gl.getUniformLocation(this.program,"u_color"),this.timeUniformLocation=this.gl.getUniformLocation(this.program,"u_time"),this.imageUniformLocation=this.gl.getUniformLocation(this.program,"u_image"),this.kernelUniformLocation=this.gl.getUniformLocation(this.program,"u_kernel"),this.kernelWeightUniformLocation=this.gl.getUniformLocation(this.program,"u_kernelWeight"),this.vertexArrayObject=this.gl.createVertexArray(),this.gl.bindVertexArray(this.vertexArrayObject);var i=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,i);this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,3,-1,-1,3,-1]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0);var r=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,r);this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([0,2,0,0,2,0]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0),this.imageTexture=n.classPrivateMethodGet(this,d,k).call(this,this.gl),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this.image),this.framebuffers=[],this.framebufferTextures=[];for(var a=0;a<2;++a){var o=n.classPrivateMethodGet(this,d,k).call(this,this.gl);this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.image.width,this.image.height,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,null),this.framebufferTextures.push(o);var h=this.gl.createFramebuffer();this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,h);var u=this.gl.COLOR_ATTACHMENT0;this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,u,this.gl.TEXTURE_2D,o,0),this.framebuffers.push(h)}this.resize(),n.classPrivateMethodGet(this,T,G).call(this),this.oninit&&this.oninit(this)}function w(e){e.useProgram(this.program),e.bindVertexArray(this.vertexArrayObject),e.activeTexture(e.TEXTURE0+0),e.bindTexture(e.TEXTURE_2D,this.imageTexture),e.uniform1i(this.imageUniformLocation,0);var t=0;for(var i in this.effectsToApply)if(this.effectsToApply[i]){var r=this.framebuffers[t%2];n.classPrivateMethodGet(this,c,P).call(this,this.gl,r,this.image.width,this.image.height);var a=this.kernels[i];n.classPrivateMethodGet(this,g,S).call(this,this.gl,a),e.bindTexture(e.TEXTURE_2D,this.framebufferTextures[t%2]),t++}n.classPrivateMethodGet(this,c,P).call(this,this.gl,null,e.canvas.width,e.canvas.height),n.classPrivateMethodGet(this,g,S).call(this,this.gl,this.kernels.normal)}function P(e,t,i,r){e.bindFramebuffer(e.FRAMEBUFFER,t),e.viewport(0,0,i,r)}function S(e,t){e.uniform1fv(this.kernelUniformLocation,t),e.uniform1f(this.kernelWeightUniformLocation,n.classPrivateMethodGet(this,_,F).call(this,t)),e.drawArrays(e.TRIANGLES,0,3)}function k(e){var t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),t}function U(e,t,i){var r=e.createShader(t);if(e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))return r;console.error(e.getShaderInfoLog(r)),e.deleteShader(r)}function y(e,t,i){var r=e.createProgram();if(e.attachShader(r,t),e.attachShader(r,i),e.linkProgram(r),e.getProgramParameter(r,e.LINK_STATUS))return r;console.error(e.getProgramInfoLog(r)),e.deleteProgram(r)}function L(e){var t=e.clientWidth,i=e.clientHeight,r=e.width!==t||e.height!==i;return r&&(e.width=t,e.height=i),r}function F(e){var t=e.reduce((function(e,t){return e+t}),0);return Math.max(0,t)}function G(){if(this.pane)for(var e in this.effectsToApply)this.pane.addInput(this.effectsToApply,e)}},{"@swc/helpers":"2CIBz","./shader/fragment.glsl":"9pKMf","./shader/vertex.glsl":"k95G7","592f3048f75e3dc8":"2SXQV","@parcel/transformer-js/src/esmodule-helpers.js":"jiucr"}],"9pKMf":[function(e,t,i){t.exports='#version 300 es\n\n// fragment shaders don\'t have a default precision so we need\n// to pick one. highp is a good default. It means "high precision"\nprecision highp float;\n#define GLSLIFY 1\n\nuniform vec4 u_color;\nuniform sampler2D u_image;\nuniform float u_time;\nuniform float[9] u_kernel;\nuniform float u_kernelWeight;\n\nout vec4 outColor;\n\nin vec2 v_uv;\n\nvoid main() {\n    vec2 onePixel = vec2(1.) / vec2(textureSize(u_image, 0));\n\n    vec4 color = texture(u_image, v_uv);\n\n    vec4 colorSum =\n        texture(u_image, v_uv + onePixel * vec2(-1, -1)) * u_kernel[0] +\n        texture(u_image, v_uv + onePixel * vec2( 0, -1)) * u_kernel[1] +\n        texture(u_image, v_uv + onePixel * vec2( 1, -1)) * u_kernel[2] +\n        texture(u_image, v_uv + onePixel * vec2(-1,  0)) * u_kernel[3] +\n        texture(u_image, v_uv + onePixel * vec2( 0,  0)) * u_kernel[4] +\n        texture(u_image, v_uv + onePixel * vec2( 1,  0)) * u_kernel[5] +\n        texture(u_image, v_uv + onePixel * vec2(-1,  1)) * u_kernel[6] +\n        texture(u_image, v_uv + onePixel * vec2( 0,  1)) * u_kernel[7] +\n        texture(u_image, v_uv + onePixel * vec2( 1,  1)) * u_kernel[8] ;\n    outColor = vec4((colorSum / u_kernelWeight).rgb, 1);\n}\n'},{}],k95G7:[function(e,t,i){t.exports="#version 300 es\n#define GLSLIFY 1\n\nin vec4 a_position;\nin vec2 a_uv;\n\nout vec2 v_uv;\n\nvoid main() {\n    v_uv = a_uv;\n    gl_Position = a_position;\n}\n"},{}],"2SXQV":[function(e,t,i){t.exports=e("./helpers/bundle-url").getBundleURL("4AYAf")+"../"+e("./helpers/bundle-manifest").resolve("d80ZC")},{"./helpers/bundle-url":"a2ypy","./helpers/bundle-manifest":"gSiLw"}],a2ypy:[function(e,t,i){"use strict";var r={};function n(e){return(""+e).replace(/^((?:https?|file|ftp):\/\/.+)\/[^/]+$/,"$1")+"/"}i.getBundleURL=function(e){var t=r[e];return t||(t=function(){try{throw new Error}catch(t){var e=(""+t.stack).match(/(https?|file|ftp):\/\/[^)\n]+/g);if(e)return n(e[2])}return"/"}(),r[e]=t),t},i.getBaseURL=n,i.getOrigin=function(e){var t=(""+e).match(/(https?|file|ftp):\/\/[^/]+/);if(!t)throw new Error("Origin not found");return t[0]}},{}]},["e5PEu","k9Dy2"],"k9Dy2");
//# sourceMappingURL=index.5a507de5.js.map
