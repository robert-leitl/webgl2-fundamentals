import { Pane } from 'tweakpane';
import { WebGLGPGPU } from './webgl-gpgpu';

let DEBUG = false;

if (process.env.NODE_ENV !== 'production') {
    // Only runs in development and will be stripped in production builds.
    DEBUG = true;
}

let sketch;
let resizeTimeoutId;

window.addEventListener('load', () => {
    const canvas = document.body.querySelector('#c');

    let pane;
    if (DEBUG) {
        pane = new Pane({ title: 'Settings' });
    }

    sketch = new WebGLGPGPU(canvas, pane, (sketch) => {
        sketch.run(); 
    });
});

window.addEventListener('resize', () => {
    if (sketch) {
        if (resizeTimeoutId)
            clearTimeout(resizeTimeoutId);

        resizeTimeoutId = setTimeout(() => {
            resizeTimeoutId = null;
            sketch.resize();
        }, 300);
    }
});


