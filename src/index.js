import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';

function init() {
  const defaultBrushSize = 1;
  const defaultBrushColor = '#000000';
  const defaultPaperColor = '#ffffff';

  const canvasContainer = new CanvasContainer({
    brushColor: defaultBrushColor,
    brushSize: defaultBrushSize,
    paperColor: defaultPaperColor,
    canvasScale: 0.1,
    canvasWidth: 320,
    canvasHeight: 320,
    patternWidth: 20,
    patternHeight: 20,
  });

  const menu = Menu({
    defaultBrushColor,
    defaultPaperColor,
    onPaperColorChange(event) {
      const eventTarget = event.currentTarget;
      canvasContainer.updatePaperColor(eventTarget.value);
      canvasContainer.fillForeground();
    },
    onBrushColorChange(event) {
      const eventTarget = event.currentTarget;
      canvasContainer.updateBrushColor(eventTarget.value);
    },
    onBrushChange(event) {
      const eventTarget = event.currentTarget;
      canvasContainer.setupBrush(eventTarget.value);
    },
  });

  const root = document.querySelector('#root');
  if (root) {
    root.appendChild(menu.el);
    root.appendChild(canvasContainer.el);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  init();
});
