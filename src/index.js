import './normalize.css';
import './index.css';

import CanvasContainer from './canvas';
import Menu from './menu';
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
  const canvasScale = 0.1;
  const canvasWidth = 320;
  const canvasHeight = 320;
  const patternSize = 20;
  const historySize = 10;
  const transitionDurationMS = 500;

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
      sourceCanvas.fillForeground();
      targetCanvas.resizeCanvas(targetSize);
      undoHistory.reset(sourceCanvas.getImageData());
    },
  });

  const dataButton = Button({
    className: 'data-button',
    content: 'copy image data \u203A',
    onClick() {
      const imageData = sourceCanvas.getImageData();
      targetCanvas.putImageDataInterpolated(imageData, transitionDurationMS);
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

  targetCanvas.clearForeground();
  undoHistory.reset(sourceCanvas.getImageData());
}
