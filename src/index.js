import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';
import MyWorker from "worker-loader!./training.worker.js";

let worker = new MyWorker();
var training = false;
import {Button} from './components/Button'

document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  const defaultBrushSize = 1;
  const defaultBrushColor = '#000000';
  const defaultDropProb = 1.0;
  const defaultPaperColor = '#ffffff';
  const defaultBrushType = 'paint';
  const canvasResolution = 256;
  const canvasSize = 320;
  const canvasWidth = canvasSize;
  const canvasHeight = canvasSize;
  const patternSize = 5;
  const patternWidth = patternSize;
  const patternHeight = patternSize;
  const canvasScale = canvasResolution/canvasSize;
  const renderRate = 5000;
  var interpoStart;
  var interpoEnd;
  var interpoTimeStart;
  var dirty = false;
  var firstEverInterpo = true;

  const sourceCanvas = new CanvasContainer({
    brushColor: defaultBrushColor,
    brushSize: defaultBrushSize,
    paperColor: defaultPaperColor,
    dropProbability: defaultDropProb,
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
    defaultBrushColor,
    defaultPaperColor,
    onPaperColorChange(paperColor) {
      sourceCanvas.updatePaperColor(paperColor);
    },
    onBrushColorChange(brushColor) {
      sourceCanvas.updateBrushColor(brushColor);
    },
    onBrushChange(brushType) {
      sourceCanvas.setupBrush(brushType);
    },
    onBrushSizeChange(brushSize) {
      sourceCanvas.updateBrushSize(brushSize);
    },
    onDropProbabilityChange(value) {
      sourceCanvas.updateDropProbability(value);
    },
    onClearButtonClick() {
      sourceCanvas.clearForeground();
    },
    onFillButtonClick() {
      sourceCanvas.fillForeground();
    },
  });

  function redraw() {
    draw();
    requestAnimationFrame(redraw)
  }
  function draw() {
      if (dirty) {
          targetCanvas.putImageData(interpoStart);
          const workCanvas = document.createElement('canvas');
          workCanvas.width = canvasResolution;
          workCanvas.height = canvasResolution;
          workCanvas.getContext('2d').putImageData(interpoEnd, 0, 0);
          targetCanvas.foregroundCanvas.context.globalAlpha = (Date.now() - interpoTimeStart) / (renderRate * 1.1);
          targetCanvas.foregroundCanvas.context.drawImage(workCanvas, 0, 0, canvasResolution, canvasResolution);
          targetCanvas.foregroundCanvas.context.globalAlpha = 1.;
          if (((Date.now() - interpoTimeStart) / (renderRate * 1.1)) >= 1.) {dirty = false;}
      }
  }
  interpoStart = interpoEnd = targetCanvas.getImageData();
  interpoTimeStart = Date.now();
  redraw();

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
            var input = [x,y];
            var array_loc = (y * imageData.width + x) * 4;
            var output = [imageData.data[array_loc + 0],
                          imageData.data[array_loc + 1],
                          imageData.data[array_loc + 2]];
            var in_dataset = imageData.data[array_loc + 3];
            if (in_dataset != 0) {
              dataset_inputs.push(input);
              dataset_outputs.push(output);
            }
        }}
        training = true;
        firstEverInterpo = true;
        this.textContent = 'starting... \u203A';
        worker = new MyWorker();
        worker.onmessage = event => {
          const data = event.data;
          if (data.command == 'update') {
            if (firstEverInterpo) {
              interpoStart = interpoEnd = new ImageData(new Uint8ClampedArray(data.image), canvasResolution, canvasResolution);
              targetCanvas.putImageData(interpoStart);
              firstEverInterpo = false;
              dirty = false;
              this.textContent = 'stop training \u203A';
            } else {
              interpoStart = targetCanvas.getImageData();
              interpoEnd = new ImageData(new Uint8ClampedArray(data.image), canvasResolution, canvasResolution);
              interpoTimeStart = Date.now();
              dirty = true;
            }
          }
        };
        worker.postMessage({command: 'start',
                            width: imageData.width,
                            height: imageData.height,
                            res: canvasResolution,
                            renderRate: renderRate,
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

  document.addEventListener('drop', async event => {
  if (!event.dataTransfer.files.length)
    return;
  event.preventDefault();
  const file = await event.dataTransfer.files.item(0);
  const image = new Image();
  image.src = URL.createObjectURL(file);
  await new Promise(x => image.onload = x);
  const workCanvas = document.createElement('canvas');
  workCanvas.width = canvasResolution;
  workCanvas.height = canvasResolution;
  const ctx = workCanvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvasResolution, canvasResolution);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  sourceCanvas.putImageData(imageData)
});
}


document.addEventListener('dragover', event => {
  event.preventDefault();
  document.body.classList.toggle('dragging', true);
});

document.addEventListener('dragend', event => {
  document.body.classList.toggle('dragging', false);
});