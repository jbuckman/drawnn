import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';

document.addEventListener('DOMContentLoaded', function () {
  init();
});

function init() {
  const defaultBrushSize = 1;
  const defaultBrushColor = '#000000';
  const defaultPaperColor = '#ffffff';
  const defaultBrushType = 'paint';
  const canvasScale = 0.1;
  const canvasWidth = 320;
  const canvasHeight = 320;
  const patternWidth = 20;
  const patternHeight = 20;

  const sourceCanvas = new CanvasContainer({
    brushColor: defaultBrushColor,
    brushSize: defaultBrushSize,
    paperColor: defaultPaperColor,
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
    onPaperColorChange(event) {
      const eventTarget = event.currentTarget;
      sourceCanvas.updatePaperColor(eventTarget.value);
    },
    onBrushColorChange(event) {
      const eventTarget = event.currentTarget;
      sourceCanvas.updateBrushColor(eventTarget.value);
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
      const imageData = sourceCanvas.getImageData();
      var dataset = [];
      for (var x=0; x<imageData.width; x++) {
      for (var y=0; y<imageData.height; y++) {
          var input = [x,y];
          var array_loc = (y * imageData.width + x) * 4;
          var output = [imageData.data[array_loc + 0],
                    imageData.data[array_loc + 1],
                    imageData.data[array_loc + 2]];
          var in_dataset = imageData.data[array_loc + 3];
          if (in_dataset != 0) dataset.push([input, output]);
      }}
      // targetCanvas.putImageData(imageData);
      console.log(dataset);
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
