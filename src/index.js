import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';
import {BasicBrush} from './brushes';

function init() {
  const defaultBrushSize = 1;
  const defaultBrushColor = 'rgba(0,0,0,0)';
  const defaultPaperColor = '#fff';
  let brush;

  const canvasContainer = CanvasContainer({
    foregroundColor: defaultPaperColor,
    canvasWidth: 32,
    canvasHeight: 32,
    patternWidth: 2,
    patternHeight: 2,
    handleCanvasMouseDown(x, y) {
      const scaleX = Math.round(x * 0.1);
      const scaleY = Math.round(y * 0.1);
      brush.strokeStart(scaleX, scaleY);
    },
    handleCanvasMouseMove(x, y) {
      const scaleX = Math.round(x * 0.1);
      const scaleY = Math.round(y * 0.1);
      brush.strokeMove(scaleX, scaleY);
    },
    handleCanvasMouseUp() {
      brush.strokeEnd();
    },
  });

  brush = new BasicBrush(canvasContainer.getForegroundContext());
  brush.updateBrushColor(defaultBrushColor);
  brush.updateBrushSize(defaultBrushSize);

  const menu = Menu({
    defaultBrushColor,
    defaultPaperColor,
    onPaperColorChange(event) {
      const eventTarget = event.currentTarget;
      canvasContainer.updateForegroundFill(eventTarget.value);
    },
    onBrushColorChange(event) {
      const eventTarget = event.currentTarget;
      brush.updateBrushColor(eventTarget.value);
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
