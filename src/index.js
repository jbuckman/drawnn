import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';
import MyWorker from "worker-loader!./training.worker.js";

let worker = new MyWorker();
var training = false;

document.addEventListener('DOMContentLoaded', function () {
  init();
});

function init() {
  const defaultBrushSize = 1;
  const defaultColor = '#000000';
  const defaultBrushType = 'paint';
  const canvasScale = 0.1;
  const canvasWidth = 320;
  const canvasHeight = 320;
  const patternWidth = 20;
  const patternHeight = 20;

  const sourceCanvas = new CanvasContainer({
    color: defaultColor,
    brushSize: defaultBrushSize,
    canvasScale,
    canvasWidth,
    canvasHeight,
    patternWidth,
    patternHeight,
  });
  sourceCanvas.initDOMElements(true);
  sourceCanvas.setupBrush(defaultBrushType);

  const targetCanvas = new CanvasContainer({
    canvasScale,
    canvasWidth,
    canvasHeight,
    patternWidth,
    patternHeight,
  });
  targetCanvas.initDOMElements(false);
  targetCanvas.clearForeground();

  const menu = Menu({
    defaultColor,
    onColorChange(event) {
      const eventTarget = event.currentTarget;
      sourceCanvas.updateColor(eventTarget.value);
    },
    onBrushChange(event) {
      const eventTarget = event.currentTarget;
      sourceCanvas.setupBrush(eventTarget.value);
    },
    onFillButtonClick() {
      sourceCanvas.fillForeground();
    },
    onClearButtonClick() {
      sourceCanvas.clearForeground();
    },
  });

  const dataButton = Button({
    className: 'data-button',
    textContent: 'start training \u203A',
    onClick() {
      if (!training) {
        const imageData = sourceCanvas.getImageData();
        var dataset_inputs = [];
        var dataset_outputs = [];
        for (var x=0; x<imageData.width; x++) {
        for (var y=0; y<imageData.height; y++) {
            var input = [x/imageData.width,y/imageData.height];
            var array_loc = (y * imageData.width + x) * 4;
            var output = [imageData.data[array_loc + 0]/255,
                          imageData.data[array_loc + 1]/255,
                          imageData.data[array_loc + 2]/255];
            var in_dataset = imageData.data[array_loc + 3];
            if (in_dataset != 0) {
              dataset_inputs.push(input);
              dataset_outputs.push(output);
            }
        }}
        training = true;
        this.textContent = 'stop training \u203A';
        worker = new MyWorker();
        worker.onmessage = event => {
          const data = event.data;
          if (data.command == 'update') {
            const oldImageData = targetCanvas.getImageData();
            const img = new Uint8ClampedArray(data.image);
            const newImageData = new ImageData(img, oldImageData.width, oldImageData.height);
            targetCanvas.putImageData(newImageData);
          }
        };
        worker.postMessage({command: 'start',
                            inputs: dataset_inputs,
                            outputs: dataset_outputs})
      } else {
        training = false;
        this.textContent = 'start training \u203A';
        worker.terminate();
      }
    },
  });

  const root = document.querySelector('#root');
  if (root) {
    const frag = document.createDocumentFragment();

    let col;
    col = document.createElement('div');
    col.className = 'canvas-column source';
    col.appendChild(menu.el);
    col.appendChild(sourceCanvas.el);
    col.appendChild(dataButton.el);
    frag.appendChild(col);

    col = document.createElement('div');
    col.className = 'canvas-column target';
    col.appendChild(targetCanvas.el);
    frag.appendChild(col);

    root.appendChild(frag);
  }
}

function Button(props = {}) {
  const defaultProps = {
    className: '',
    textContent: '',
    onClick() {},
  };
  const {className, textContent, onClick} = Object.assign(defaultProps, props);

  let el = document.createElement('button');
  el.className = `btn btn-outline${className ? ' ' + className : ''}`;
  el.textContent = textContent;
  el.alt = textContent;
  el.title = textContent;
  el.addEventListener('click', onClick);

  return {el};
}