import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';
import MyWorker from "worker-loader!./training.worker.js";

let worker = new MyWorker();
var training = false;
import UndoHistory, {testHistory} from './history';
import {Button} from './components/Button';

document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  testHistory();

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
  const historySize = 10;
  const transitionDurationMS = 5000;

  const undoHistory = UndoHistory(historySize, {
    onUpdate() {
      console.debug(undoHistory.toString());

      if (undoHistory.atStart) {
        menu.disableUndoButton();
      } else {
        menu.enableUndoButton();
      }

      if (undoHistory.atEnd) {
        menu.disableRedoButton();
      } else {
        menu.enableRedoButton();
      }
    },
  });

  const sourceCanvas = new CanvasContainer({
    id: 'source',
    brushColor: defaultBrushColor,
    brushSize: defaultBrushSize,
    paperColor: defaultPaperColor,
    dropProbability: defaultDropProb,
    trackHistory: true,
    canvasScale,
    canvasWidth,
    canvasHeight,
    patternSize,
    onCanvasUpdate() {
      undoHistory.push(sourceCanvas.getImageData());
    },
  });
  sourceCanvas.initDOMElements(true);
  sourceCanvas.setupBrush(defaultBrushType);

  const targetCanvas = new CanvasContainer({
    id: 'target',
    canvasScale,
    canvasWidth,
    canvasHeight,
    patternSize,
  });
  targetCanvas.initDOMElements(false);

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
    onUndoButtonClick() {
      if (!undoHistory.atStart) {
        undoHistory.undo();
        sourceCanvas.putImageData(undoHistory.currentItem);
      }
    },
    onRedoButtonClick() {
      if (!undoHistory.atEnd) {
        undoHistory.redo();
        sourceCanvas.putImageData(undoHistory.currentItem);
      }
    },
    onResolutionChange(event) {
      const targetSize = Number(event.target.value);
      sourceCanvas.resizeCanvas(targetSize);
      sourceCanvas.clearForeground();
      targetCanvas.resizeCanvas(targetSize);
      undoHistory.reset(sourceCanvas.getImageData());
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
    content: 'start training \u203A',
    onClick() {
      if (!training) {
        training = true;
        firstEverInterpo = true;
        this.textContent = 'starting...';
        targetCanvas.clearForeground(1.);


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
        worker = new MyWorker();
        var lastImgWrite = null;
        worker.onmessage = event => {
          const img = new ImageData(new Uint8ClampedArray(event.data.image), sourceCanvas.canvasHeightComputed, sourceCanvas.canvasHeightComputed);
          if (lastImgWrite == null) {
            targetCanvas.putImageData(img);
            this.textContent = 'stop training \u203A';
            lastImgWrite = Date.now();
          }
          else if (Date.now() - lastImgWrite > transitionDurationMS) {
            targetCanvas.putImageDataInterpolated(img, transitionDurationMS);
            lastImgWrite = Date.now();
          }
          /*
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
          } */
        };
        worker.postMessage({command: 'start',
                            width: imageData.width,
                            height: imageData.height,
                            res: sourceCanvas.canvasHeightComputed,
                            renderRate: renderRate,
                            inputs: dataset_inputs,
                            outputs: dataset_outputs})
      } else {
          worker.terminate();
          training = false;
          this.textContent = 'start training \u203A';
      }
/*
    content: 'copy image data \u203A',
    onClick() {
      const imageData = sourceCanvas.getImageData();
      targetCanvas.putImageDataInterpolated(imageData, transitionDurationMS);
*/
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
  workCanvas.width = sourceCanvas.canvasHeightComputed;
  workCanvas.height = sourceCanvas.canvasHeightComputed;
  const ctx = workCanvas.getContext('2d');
  ctx.drawImage(image, 0, 0, sourceCanvas.canvasHeightComputed, sourceCanvas.canvasHeightComputed);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  sourceCanvas.putImageData(imageData)
});

  targetCanvas.clearForeground();
  undoHistory.reset(sourceCanvas.getImageData());
}


document.addEventListener('dragover', event => {
  event.preventDefault();
  document.body.classList.toggle('dragging', true);
});

document.addEventListener('dragend', event => {
  document.body.classList.toggle('dragging', false);
});