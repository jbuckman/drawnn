import {BasicBrush, Eraser} from './brushes';
import './canvas.css';

function checkerboard(context, patternSize, patternColor) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const halfSize = patternSize / 2;
  c.width = patternSize;
  c.height = patternSize;
  ctx.fillStyle = patternColor;
  ctx.fillRect(0, 0, halfSize, halfSize);
  ctx.fillRect(halfSize, halfSize, halfSize, halfSize);
  return context.createPattern(c, 'repeat');
}

function BackgroundCanvas(props) {
  // patterned background canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const pattern = checkerboard(context, props.patternSize, props.patternColor);
  canvas.className = 'canvas-back';
  canvas.width = props.width;
  canvas.height = props.height;
  context.fillStyle = pattern;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  return {
    context,
    el: canvas,
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
      context.fillStyle = pattern;
      context.fillRect(0, 0, width, height);
      context.save();
    },
  };
}

function ForegroundCanvas(props) {
  function onCanvasMouseDown(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    props.handleCanvasMouseDown(x, y, event.shiftKey);
    canvas.addEventListener('mousemove', onCanvasMouseMove, false);
    canvas.addEventListener('mouseout', onCanvasMouseOut, false);
    document.addEventListener('mouseup', onCanvasMouseUp, false);
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
    document.removeEventListener('mouseup', onCanvasMouseUp, false);
  }

  function onCanvasDragDrop(event) {
    // prevent default action (open as link for some elements)
    event.preventDefault();
    props.handleCanvasDragDrop(event);
  }

  function dropRandomPixels(dropProb) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const numPixels = imageData.data.length;
    for (let i = 0; i < numPixels; i += 4) {
      if (Math.random() <= dropProb) {
        imageData.data[i] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = 0;
      }
    }
    context.putImageData(imageData, 0, 0);
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.className = 'canvas-fore';
  canvas.width = props.width;
  canvas.height = props.height;
  context.imageSmoothingEnabled = false;
  context.fillStyle = props.fillColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();

  if (typeof props.handleCanvasMouseDown === 'function') {
    canvas.addEventListener('mousedown', onCanvasMouseDown, false);
    /** prevent default to allow drop  */
    document.addEventListener('dragover', event => event.preventDefault());
    canvas.addEventListener('dragenter', props.handleCanvasDragEnter, false);
    canvas.addEventListener('dragleave', props.handleCanvasDragLeave, false);
    canvas.addEventListener('drop', onCanvasDragDrop, false);
  }

  return {
    context,
    el: canvas,
    fill(fillColor) {
      context.save();
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = fillColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    },
    clear(dropProb = 1) {
      context.save();
      if (dropProb < 1) {
        dropRandomPixels(dropProb);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      context.restore();
    },
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
    },
  };
}

const defaultProps = {
  brushColor: '#000000',
  brushSize: 1,
  brushType: 'paint',
  canvasScale: 1,
  canvasWidth: 320,
  canvasHeight: 320,
  paperColor: 'rgba(0,0,0,0)',
  patternColor: 'rgba(0,0,0,0.1)',
  patternSize: 20,
  onCanvasUpdate() {},
};

export default class CanvasContainer {
  constructor(props) {
    const {
      id,
      brushColor,
      brushSize,
      brushType,
      canvasScale,
      canvasHeight,
      canvasWidth,
      dropProbability,
      paperColor,
      patternColor,
      patternSize,
      onCanvasUpdate,
    } = Object.assign(defaultProps, props);

    this.id = id;
    this.brushColor = brushColor;
    this.brushSize = brushSize;
    this.brushType = brushType;
    this.canvasScale = canvasScale;
    this.dropProbability = dropProbability;
    this.paperColor = paperColor;
    this.patternColor = patternColor;
    this.patternSize = patternSize;
    this.onCanvasUpdate = onCanvasUpdate;

    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.canvasHeightComputed = Math.ceil(canvasHeight * canvasScale);
    this.canvasWidthComputed = Math.ceil(canvasWidth * canvasScale);
    this.patternSizeComputed = Math.ceil(patternSize * canvasScale);

    this.el = null;
    this.brush = null;
    this.backgroundCanvas = null;
    this.foregroundCanvas = null;
  }

  initDOMElements(initCanvasEventHandlers = false) {
    const bg = BackgroundCanvas({
      width: this.canvasWidthComputed,
      height: this.canvasHeightComputed,
      patternSize: this.patternSizeComputed,
      patternColor: this.patternColor,
    });

    const fg = ForegroundCanvas({
      width: this.canvasWidthComputed,
      height: this.canvasHeightComputed,
      fillColor: this.paperColor,
      handleCanvasMouseDown: initCanvasEventHandlers
        ? this.brushStrokeStart.bind(this)
        : null,
      handleCanvasMouseMove: initCanvasEventHandlers
        ? this.brushStrokeMove.bind(this)
        : null,
      handleCanvasMouseUp: initCanvasEventHandlers
        ? this.brushStrokeEnd.bind(this)
        : null,
      handleCanvasDragEnter: initCanvasEventHandlers
        ? this.canvasDropZoneActivate.bind(this)
        : null,
      handleCanvasDragLeave: initCanvasEventHandlers
        ? this.canvasDropZoneDeactivate.bind(this)
        : null,
      handleCanvasDragDrop: initCanvasEventHandlers
        ? this.handleCanvasDragDrop.bind(this)
        : null,
    });

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
        this.brush.updateBrushColor(this.brushColor);
        this.brush.updateBrushSize(this.brushSize);
        break;
    }
  }

  resizeCanvas(targetSize) {
    this.canvasScale = targetSize / this.canvasHeight;
    this.canvasHeightComputed = Math.ceil(this.canvasHeight * this.canvasScale);
    this.canvasWidthComputed = Math.ceil(this.canvasWidth * this.canvasScale);
    this.patternSizeComputed = Math.ceil(this.patternSize * this.canvasScale);

    this.foregroundCanvas.resize(
      this.canvasWidthComputed,
      this.canvasHeightComputed
    );
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

  updateDropProbability(dropProb) {
    this.dropProbability = dropProb;
  }

  fillForeground() {
    this.foregroundCanvas.fill(this.paperColor);
    this.onCanvasUpdate();
  }

  clearForeground(dropProbability) {
    this.foregroundCanvas.clear(
      dropProbability == null ? this.dropProbability : dropProbability
    );
    this.onCanvasUpdate();
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

  drawImage(image, dx = 0, dy = 0) {
    this.foregroundCanvas.context.drawImage(
      image,
      0,
      0,
      this.canvasWidthComputed,
      this.canvasHeightComputed
    );
    this.onCanvasUpdate();
  }

  putImageDataInterpolated(imageData, transitionDurationMS = 1000) {
    const startTime = Date.now();
    const targetCtx = this.foregroundCanvas.context;
    const interpolationRate = 1 / transitionDurationMS;

    const oldCanvas = document.createElement('canvas');
    oldCanvas.width = this.canvasWidthComputed;
    oldCanvas.height = this.canvasHeightComputed;
    oldCanvas.getContext('2d').drawImage(this.foregroundCanvas.el, 0, 0);
    
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = this.canvasWidthComputed;
    tmpCanvas.height = this.canvasHeightComputed;
    tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);

    function lerp() {
      const dt = Date.now() - startTime;
      const alpha = interpolationRate * dt;
      targetCtx.globalAlpha = 1 - alpha;
      targetCtx.drawImage(oldCanvas, 0, 0);
      targetCtx.globalAlpha = alpha;
      targetCtx.drawImage(tmpCanvas, 0, 0);
      if (dt < transitionDurationMS) {
        requestAnimationFrame(lerp);
        return;
      }
      oldCanvas.remove();
      tmpCanvas.remove();
      targetCtx.restore();
    }

    targetCtx.save();
    requestAnimationFrame(lerp);
  }

  computeCanvasX(xValue) {
    const xRatio = this.canvasWidth / this.foregroundCanvas.el.clientWidth;
    return Math.ceil(xValue * xRatio * this.canvasScale);
  }

  computeCanvasY(yValue) {
    const yRatio = this.canvasHeight / this.foregroundCanvas.el.clientHeight;
    return Math.ceil(yValue * yRatio * this.canvasScale);
  }

  canvasDropZoneActivate() {
    this.el.classList.add('dropzone-active');
  }

  canvasDropZoneDeactivate() {
    this.el.classList.remove('dropzone-active');
  }

  async handleCanvasDragDrop(event) {
    this.canvasDropZoneDeactivate();

    if (!event.dataTransfer.files.length) return;

    const file = await event.dataTransfer.files.item(0);
    const image = new Image();
    image.onload = () => this.drawImage(image);
    image.src = URL.createObjectURL(file);
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
    this.onCanvasUpdate();
  }
}
