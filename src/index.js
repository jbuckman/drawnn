import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';

function init() {
  const defaultBrushColor = 'red';
  const defaultPaperColor = 'white';
  const canvasContainer = CanvasContainer();
  const menu = Menu({
    defaultBrushColor,
    defaultPaperColor,
    onPaperColorChange(event) {
      const eventTarget = event.currentTarget;
      canvasContainer.updateForegroundFill(eventTarget.value);
    },
    onBrushColorChange(event) {
      const eventTarget = event.currentTarget;
      console.log('brushColor', eventTarget);
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
