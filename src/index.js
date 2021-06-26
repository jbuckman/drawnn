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

  const canvasContainer = new CanvasContainer({
    brushColor: defaultBrushColor,
    brushSize: defaultBrushSize,
    paperColor: defaultPaperColor,
    canvasScale,
    canvasWidth,
    canvasHeight,
    patternWidth,
    patternHeight,
  });
  canvasContainer.initDOMElements(true);
  canvasContainer.setupBrush(defaultBrushType);

  const menu = Menu({
    defaultBrushColor,
    defaultPaperColor,
    onPaperColorChange(event) {
      const eventTarget = event.currentTarget;
      canvasContainer.updatePaperColor(eventTarget.value);
    },
    onBrushColorChange(event) {
      const eventTarget = event.currentTarget;
      canvasContainer.updateBrushColor(eventTarget.value);
    },
    onBrushChange(event) {
      const eventTarget = event.currentTarget;
      canvasContainer.setupBrush(eventTarget.value);
    },
    onFillButtonClick() {
      canvasContainer.fillForeground();
    },
    onClearButtonClick() {
      canvasContainer.clearForeground();
    },
  });

  const dataButton = Button({
    className: 'data-button',
    textContent: 'get image data',
    onClick() {
      const imageData = canvasContainer.getImageData();
      console.log(imageData);
    },
  });

  const root = document.querySelector('#root');
  if (root) {
    let widget = document.createElement('div');
    widget.className = 'canvas-widget';
    widget.appendChild(menu.el)
    widget.appendChild(canvasContainer.el);
    widget.appendChild(dataButton.el);

    root.appendChild(widget);
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
