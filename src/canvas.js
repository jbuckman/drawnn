import {BasicBrush, Eraser} from './brushes';
import './canvas.css';

function BackgroundCanvas(props) {
  // patterned background canvas
  const patternCanvas = document.createElement('canvas');
  const patternCtx = patternCanvas.getContext('2d');
  const halfSize = props.patternSize / 2;
  patternCanvas.width = props.patternSize;
  patternCanvas.height = props.patternSize;
  patternCtx.fillStyle = props.patternColor;
  patternCtx.fillRect(0, 0, halfSize, halfSize);
  patternCtx.fillRect(halfSize, halfSize, halfSize, halfSize);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const pattern = context.createPattern(patternCanvas, 'repeat');
  canvas.className = 'canvas-back';
  canvas.width = props.width;
  canvas.height = props.height;
  context.fillStyle = pattern;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  return {context, el: canvas};
}

function ForegroundCanvas(props) {
  function onCanvasMouseDown(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    props.handleCanvasMouseDown(x, y, event.shiftKey);
    canvas.addEventListener('mousemove', onCanvasMouseMove, false);
    canvas.addEventListener('mouseout', onCanvasMouseOut, false);
    window.addEventListener('mouseup', onCanvasMouseUp, false);
  }

  function onCanvasMouseMove(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    props.handleCanvasMouseMove(x, y);
  }

  function onCanvasMouseOut() {
    props.handleCanvasMouseUp();
    canvas.removeEventListener('mouseout', onCanvasMouseOut, false);
    canvas.addEventListener('mouseover', onCanvasMouseOver, false);
  }

  function onCanvasMouseOver(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    props.handleCanvasMouseDown(x, y, false);
    canvas.removeEventListener('mouseover', onCanvasMouseOver, false);
    canvas.addEventListener('mouseout', onCanvasMouseOut, false);
  }

  function onCanvasMouseUp() {
    props.handleCanvasMouseUp();
    canvas.removeEventListener('mousemove', onCanvasMouseMove, false);
    canvas.removeEventListener('mouseout', onCanvasMouseOut, false);
    canvas.removeEventListener('mouseover', onCanvasMouseOver, false);
    window.removeEventListener('mouseup', onCanvasMouseUp, false);
  }

  function dropRandom(dropProb) {
    for (let x = 0; x < canvas.width; ++x) {
      for (let y = 0; y < canvas.height; ++y) {
        if (Math.random() <= dropProb) {
          context.clearRect(x, y, 1, 1);
        }
      }
    }
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.className = 'canvas-fore';
  canvas.width = props.width;
  canvas.height = props.height;
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = props.fillColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();

  if (typeof props.handleCanvasMouseDown === 'function') {
    canvas.addEventListener('mousedown', onCanvasMouseDown, false);
  }

  return {
    context,
    el: canvas,
    fill(fillColor) {
      console.debug('ForegroundCanvas.fill', fillColor);
      context.save();
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = fillColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    },
    clear(dropProb) {
      context.save();
      if (dropProb < 1.0) {
        dropRandom(dropProb);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      context.restore();
    },
    clear10() {
      console.debug('ForegroundCanvas.clear10');
      context.save();
      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
           if (Math.random() < 0.1)
             context.clearRect(x,y,1,1);
        }
      }
      context.restore();
    },

  };
}

const defaultProps = {
  color: '#000000',
  brushSize: 1,
  brushType: 'paint',
  canvasScale: 1,
  canvasWidth: 320,
  canvasHeight: 320,
  patternSize: 20,
  patternColor: 'rgba(0,0,0,0.1)',
  handleCanvasMouseDown() {},
  handleCanvasMouseMove() {},
  handleCanvasMouseUp() {},
};

export default class CanvasContainer {
  constructor(props) {
    const {
      color,
      brushSize,
      brushType,
      canvasScale,
      canvasHeight,
      canvasWidth,
      dropProbability,
      paperColor,
      patternColor,
      patternSize,
    } = Object.assign(defaultProps, props);

    this.color = color;
    this.brushSize = brushSize;
    this.brushType = brushType;
    this.canvasScale = canvasScale;
    this.dropProbability = dropProbability;
    this.paperColor = paperColor;
    this.patternColor = patternColor;

    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.canvasHeightComputed = Math.ceil(canvasHeight * canvasScale);
    this.canvasWidthComputed = Math.ceil(canvasWidth * canvasScale);
    this.patternSize = Math.ceil(patternSize * canvasScale);

    this.el = null;
    this.brush = null;
    this.backgroundCanvas = null;
    this.foregroundCanvas = null;
  }

  initDOMElements(initBrushEventHandlers = false) {
    const bg = BackgroundCanvas({
      width: this.canvasWidthComputed,
      height: this.canvasHeightComputed,
      patternSize: this.patternSize,
      patternColor: this.patternColor,
    });

    const fg = ForegroundCanvas({
      width: this.canvasWidthComputed,
      height: this.canvasHeightComputed,
      fillColor: this.color,
      handleCanvasMouseDown: initBrushEventHandlers
        ? this.brushStrokeStart.bind(this)
        : null,
      handleCanvasMouseMove: initBrushEventHandlers
        ? this.brushStrokeMove.bind(this)
        : null,
      handleCanvasMouseUp: initBrushEventHandlers
        ? this.brushStrokeEnd.bind(this)
        : null,
    }); fg.clear();

    const container = document.createElement('div');
    container.className = 'canvas-container';
    container.style.height = `${this.canvasHeight}px`;
    container.style.width = `${this.canvasWidth}px`;
    container.appendChild(bg.el);
    container.appendChild(fg.el);

    this.backgroundCanvas = bg;
    this.foregroundCanvas = fg;
    this.el = container;
  }

  setupBrush(brushType) {
    if (this.brush && this.brush.destroy) {
      this.brush.destroy();
    }

    this.brushType = brushType;
    switch (brushType) {
      case 'erase':
        this.brush = new Eraser(this.foregroundCanvas.context);
        this.brush.updateBrushSize(this.brushSize);
        break;

      case 'draw':
      default:
        this.brush = new BasicBrush(this.foregroundCanvas.context);
        this.brush.updateColor(this.color);
        this.brush.updateBrushSize(this.brushSize);
        break;
    }
  }

  updateBrushColor(color) {
    this.color = color;
    this.brush.updateColor(color);
  }

  updateBrushSize(brushSize) {
    this.brushSize = brushSize;
    this.brush.updateBrushSize(brushSize);
  }

  updatePaperColor(paperColor) {
    this.paperColor = paperColor;
  }

  updateDropProbability(dropProb) {
    this.dropProbability = dropProb;
  }

  fillForeground() {
    this.foregroundCanvas.fill(this.paperColor);
  }

  clearForeground() {
    this.foregroundCanvas.clear(this.dropProbability);
  }

  clear10Foreground() {
    this.foregroundCanvas.clear10();
  }

  getImageData() {
    return this.foregroundCanvas.context.getImageData(
      0,
      0,
      this.canvasWidthComputed,
      this.canvasHeightComputed
    );
  }

  putImageData(imageData) {
    this.foregroundCanvas.context.putImageData(imageData, 0, 0);
  }

  computeCanvasX(xValue) {
    const xRatio = this.canvasWidth / this.foregroundCanvas.el.clientWidth;
    return Math.ceil(xValue * xRatio * this.canvasScale);
  }

  computeCanvasY(yValue) {
    const yRatio = this.canvasHeight / this.foregroundCanvas.el.clientHeight;
    return Math.ceil(yValue * yRatio * this.canvasScale);
  }

  brushStrokeStart(x, y, shiftKey) {
    const canvasX = this.computeCanvasX(x);
    const canvasY = this.computeCanvasY(y);
    this.brush.strokeStart(canvasX, canvasY, shiftKey);
  }

  brushStrokeMove(x, y) {
    const canvasX = this.computeCanvasX(x);
    const canvasY = this.computeCanvasY(y);
    this.brush.strokeMove(canvasX, canvasY);
  }

  brushStrokeEnd() {
    this.brush.strokeEnd();
  }
}
