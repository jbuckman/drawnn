const DEFAULT_BRUSH_SIZE = 1;
const DEFAULT_BRUSH_COLOR = '#000000';

export class BasicBrush {
  constructor(context) {
    this.context = context;
    this.compositeOperation = 'source-over';
    this.brushColor = DEFAULT_BRUSH_COLOR;
    this.updateBrushSize(DEFAULT_BRUSH_SIZE);
  }

  updateBrushColor(brushColor) {
    this.brushColor = brushColor;
  }

  updateBrushSize(brushSize) {
    this.brushSize = brushSize;
    this.dx = Math.ceil(this.brushSize / 2);
    this.dy = this.dx;
  }

  destroy() {
    // remove references to the context
    this.context = null;
  }

  strokeStart(x, y) {
    this.prevX = x;
    this.prevY = y;
    this.context.save();
    this.context.globalCompositeOperation = this.compositeOperation;
    this.context.fillStyle = this.brushColor;
    this.context.fillRect(
      x - this.dx,
      y - this.dy,
      this.brushSize,
      this.brushSize
    );
  }

  strokeMove(x, y) {
    this.context.fillRect(
      x - this.dx,
      y - this.dy,
      this.brushSize,
      this.brushSize
    );
  }

  strokeEnd() {
    this.context.restore();
  }
}

export class Eraser extends BasicBrush {
  constructor(context) {
    super(context);
    this.compositeOperation = 'destination-out';
    this.brushColor = 'rgba(0,0,0,1)';
  }

  updateBrushColor(brushColor) {
    // the eraser brush color should not change
    return;
  }
}
