import "@testing-library/jest-dom";

global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }

  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this);
  }

  unobserve() {}

  disconnect() {}
};

HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillRect: () => {},

    clearRect: () => {},

    getImageData: (x, y, w, h) => {
      return {
        data: new Array(w * h * 4),
      };
    },

    putImageData: () => {},

    createImageData: () => [],

    setTransform: () => {},

    drawImage: () => {},

    save: () => {},

    fillText: () => {},

    restore: () => {},

    beginPath: () => {},

    moveTo: () => {},

    lineTo: () => {},

    closePath: () => {},

    stroke: () => {},

    translate: () => {},

    scale: () => {},

    rotate: () => {},

    arc: () => {},

    fill: () => {},

    measureText: () => {
      return { width: 0 };
    },

    transform: () => {},

    rect: () => {},

    clip: () => {},
  };
};

HTMLCanvasElement.prototype.toDataURL = () => "";

HTMLCanvasElement.prototype.getContext = () => null;

global.fetch = vi.fn();
