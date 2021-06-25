const DEFAULT_BRUSH_SIZE = 10;
const DEFAULT_BRUSH_COLOR = '#000000';

export class BasicBrush {
  constructor(context) {
    this.context = context;
    this.brushColor = DEFAULT_BRUSH_COLOR;
    this.brushSize = DEFAULT_BRUSH_SIZE;
    this.prevX = null;
    this.prevY = null;
  }

  updateBrushColor(brushColor) {
    this.brushColor = brushColor;
  }

  updateBrushSize(brushSize) {
    this.brushSize = brushSize;
  }

  destroy() {
    this.context = null;
  }

  strokeStart(x, y) {
    console.debug('BasicBrush.strokeStart', x, y);
    this.prevX = x;
    this.prevY = y;
    this.context.save();
    this.context.globalCompositeOperation = 'source-over';
    this.context.lineWidth = this.brushSize;
    this.context.strokeStyle = this.brushColor;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
  }

  strokeMove(x, y) {
    this.context.beginPath();
    this.context.moveTo(this.prevX, this.prevY);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.prevX = x;
    this.prevY = y;
  }

  strokeEnd() {
    console.debug('BasicBrush.strokeEnd');
    this.context.restore();
  }
}

export class Eraser {
  constructor(context) {
    this.context = context;
    this.brushColor = 'rgba(0,0,0,1)';
    this.brushSize = DEFAULT_BRUSH_SIZE;
    this.prevX = null;
    this.prevY = null;
  }

  updateBrushColor(brushColor) {
    // the eraser brush color should not change
    return;
  }

  updateBrushSize(brushSize) {
    this.brushSize = brushSize;
  }

  destroy() {
    this.context = null;
  }

  strokeStart(x, y) {
    console.debug('Eraser.strokeStart', x, y);
    this.prevX = x;
    this.prevY = y;
    this.context.save();
    this.context.globalCompositeOperation = 'destination-out';
    this.context.lineWidth = this.brushSize;
    this.context.strokeStyle = this.brushColor;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
  }

  strokeMove(x, y) {
    this.context.beginPath();
    this.context.moveTo(this.prevX, this.prevY);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.prevX = x;
    this.prevY = y;
  }

  strokeEnd() {
    console.debug('Eraser.strokeEnd');
    this.context.restore();
  }
}
