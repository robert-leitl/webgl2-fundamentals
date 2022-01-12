
import fragmentShader from './shader/fragment.glsl';
import vertexShader from './shader/vertex.glsl';

export class Sketch {
    oninit;

    #isDestroyed = false;

    constructor(container, pane) {
        this.container = container;
        this.pane = pane;

        this.#init();
    }

    resize() {
        
    }

    run() {
        if (this.#isDestroyed) return;

        this.#render();

        requestAnimationFrame(() => this.run());
    }

    #render() {

    }

    destroy() {
        this.#isDestroyed = true;
    }

    #init() {
        this.resize();

        this.#initTweakpane();

        if (this.oninit) this.oninit();
    }

    #initTweakpane() {
        if (this.pane) {
            // init tweakpane folders and inputs
        }
    }
}
