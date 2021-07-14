const DEFAULT_BRUSH_SIZE = 2;
const DEFAULT_BRUSH_COLOR = '#000000';

export class BasicBrush {
  constructor(context) {
    this.context = context;
    this.compositeOperation = 'source-over';
    this.brushColor = DEFAULT_BRUSH_COLOR;
    this.prevX = null;
    this.prevY = null;
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

  drawLine(x0, y0, x1, y1) {
    // line drawing using bresenham algo
    // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm#Algorithm
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.paintSquare(x0, y0);

      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  paintSquare(x, y) {
    this.context.fillRect(
      x - this.dx,
      y - this.dy,
      this.brushSize,
      this.brushSize
    );
  }

  strokeStart(x, y, shiftKey = false) {
    this.context.save();
    this.context.globalCompositeOperation = this.compositeOperation;
    this.context.fillStyle = this.brushColor;
    this.paintSquare(x, y);

    // draw line from previous x,y if shift key is held down
    if (shiftKey && this.prevX != null && this.prevY != null) {
      this.drawLine(this.prevX, this.prevY, x, y);
    }

    this.prevX = x;
    this.prevY = y;
  }

  strokeMove(x, y) {
    this.paintSquare(x, y);
    this.prevX = x;
    this.prevY = y;
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

  updateBrushColor() {
    // the eraser brush color should not change
    return;
  }
}
