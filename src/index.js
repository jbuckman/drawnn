import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';

document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  const defaultBrushSize = 1;
  const defaultBrushColor = '#000000';
  const defaultDropProb = 1.0;
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

  const dataButton = Button({
    className: 'data-button',
    textContent: 'copy image data \u203A',
    onClick() {
      const imageData = sourceCanvas.getImageData();
      targetCanvas.putImageData(imageData);
      console.log(imageData);
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

  const el = document.createElement('button');
  el.className = `btn btn-outline${className ? ' ' + className : ''}`;
  el.textContent = textContent;
  el.alt = textContent;
  el.title = textContent;
  el.addEventListener('click', onClick);

  return {el};
}
