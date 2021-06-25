import {BasicBrush, Eraser} from './brushes';
import './canvas.css';

function BackgroundCanvas(props) {
  // patterned background canvas
  const patternCanvas = document.createElement('canvas');
  const patternCtx = patternCanvas.getContext('2d');
  const halfSize = props.patternSize / 2;
  patternCanvas.width = props.patternSize;
  patternCanvas.height = props.patternSize;
  patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
  patternCtx.fillStyle = props.patternColor;
  patternCtx.fillRect(0, 0, halfSize, halfSize);
  patternCtx.fillRect(halfSize, halfSize, halfSize, halfSize);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const pattern = context.createPattern(patternCanvas, 'repeat');
  canvas.className = 'canvas-back';
  canvas.width = props.width;
  canvas.height = props.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = pattern;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  return {context, el: canvas};
}

function ForegroundCanvas(props) {
  function onCanvasMouseDown(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    props.handleCanvasMouseDown(x, y);
    canvas.addEventListener('mousemove', onCanvasMouseMove, false);
    canvas.addEventListener('mouseout', onCanvasMouseOut, false);
    window.addEventListener('mouseup', onCanvasMouseUp, false);
  }

  function onCanvasMouseMove(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    props.handleCanvasMouseMove(x, y);
  }

  function onCanvasMouseOut(event) {
    props.handleCanvasMouseUp();
    canvas.removeEventListener('mouseout', onCanvasMouseOut, false);
    canvas.addEventListener('mouseover', onCanvasMouseOver, false);
  }

  function onCanvasMouseOver(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    props.handleCanvasMouseDown(x, y);
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

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.className = 'canvas-fore';
  canvas.width = props.width;
  canvas.height = props.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = props.fillColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();

  canvas.addEventListener('mousedown', onCanvasMouseDown, false);

  return {
    context,
    el: canvas,
    fill(fillColor) {
      console.debug('ForegroundCanvas.fill', fillColor);
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = fillColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.save();
    },
  };
}

const defaultProps = {
  brushColor: '#000',
  brushSize: 1,
  brushType: 'basic',
  canvasScale: 1,
  canvasWidth: 320,
  canvasHeight: 320,
  paperColor: 'rgba(0,0,0,0)',
  patternSize: 20,
  patternColor: 'rgba(0,0,0,0.1)',
  handleCanvasMouseDown(x, y) {},
  handleCanvasMouseMove(x, y) {},
  handleCanvasMouseUp() {},
};

export default class CanvasContainer {
  constructor(props) {
    const {
      brushColor,
      brushSize,
      brushType,
      canvasScale,
      canvasHeight,
      canvasWidth,
      paperColor,
      patternColor,
      patternSize,
    } = Object.assign(defaultProps, props);

    this.brushColor = brushColor;
    this.brushSize = brushSize;
    this.brushType = brushType;
    this.canvasScale = canvasScale;
    this.paperColor = paperColor;
    this.patternColor = patternColor;

    this.canvasHeight = canvasHeight * canvasScale;
    this.canvasWidth = canvasWidth * canvasScale;
    this.patternSize = patternSize * canvasScale;

    this.el = null;
    this.brush = null;
    this.backgroundCanvas = null;
    this.foregroundCanvas = null;

    this.initDOMElements();
    this.setupBrush(brushType);
  }

  initDOMElements() {
    const bg = BackgroundCanvas({
      width: this.canvasWidth,
      height: this.canvasHeight,
      patternSize: this.patternSize,
      patternColor: this.patternColor,
    });

    const fg = ForegroundCanvas({
      width: this.canvasWidth,
      height: this.canvasHeight,
      fillColor: this.paperColor,
      handleCanvasMouseDown: this.brushStrokeStart.bind(this),
      handleCanvasMouseMove: this.brushStrokeMove.bind(this),
      handleCanvasMouseUp: this.brushStrokeEnd.bind(this),
    });

    let container = document.createElement('div');
    container.className = 'canvas-container';
    container.appendChild(bg.el);
    container.appendChild(fg.el);

    this.backgroundCanvas = bg;
    this.foregroundCanvas = fg;
    this.el = container;
  }

  setupBrush(brushType) {
    switch (brushType) {
      case 'eraser':
        this.brush = new Eraser(this.foregroundCanvas.context);
        this.brush.updateBrushSize(this.brushSize);
        break;

      case 'basic':
      default:
        this.brush = new BasicBrush(this.foregroundCanvas.context);
        this.brush.updateBrushColor(this.brushColor);
        this.brush.updateBrushSize(this.brushSize);
        break;
    }
  }

  updateBrushColor(brushColor) {
    this.brushColor = brushColor;
    this.brush.updateBrushColor(brushColor);
  }

  updateBrushSize(brushSize) {
    this.brushSize = brushSize;
    this.brush.updateBrushSize(brushSize);
  }

  updatePaperColor(paperColor) {
    this.paperColor = paperColor;
  }

  fillForeground() {
    this.foregroundCanvas.fill(this.paperColor);
  }

  brushStrokeStart(x, y) {
    const scaleX = Math.round(x * this.canvasScale);
    const scaleY = Math.round(y * this.canvasScale);
    this.brush.strokeStart(scaleX, scaleY);
  }

  brushStrokeMove(x, y) {
    const scaleX = Math.round(x * this.canvasScale);
    const scaleY = Math.round(y * this.canvasScale);
    this.brush.strokeMove(scaleX, scaleY);
  }

  brushStrokeEnd() {
    this.brush.strokeEnd();
  }
}
