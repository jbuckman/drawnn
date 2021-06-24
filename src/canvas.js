import './canvas.css';

function BackgroundCanvas(props) {
  // patterned background canvas
  const patternCanvas = document.createElement('canvas');
  const patternCtx = patternCanvas.getContext('2d');
  const halfWidth = props.patternWidth / 2;
  const halfHeight = props.patternWidth / 2;
  patternCanvas.width = props.patternWidth;
  patternCanvas.height = props.patternHeight;
  patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
  patternCtx.fillStyle = props.patternColor;
  patternCtx.fillRect(0, 0, halfWidth, halfHeight);
  patternCtx.fillRect(halfWidth, halfHeight, halfWidth, halfHeight);

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
    updateFillColor(fillColor) {
      context.fillStyle = fillColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.save();
    },
  };
}

const defaultProps = {
  foregroundColor: 'rgba(0,0,0,0)',
  canvasWidth: 320,
  canvasHeight: 320,
  patternWidth: 20,
  patternHeight: 20,
  patternColor: 'rgba(0,0,0,0.1)',
  handleCanvasMouseDown(x, y) {},
  handleCanvasMouseMove(x, y) {},
  handleCanvasMouseUp() {},
};

export default function CanvasContainer(props = {}) {
  const {
    canvasHeight,
    canvasWidth,
    foregroundColor,
    patternColor,
    patternHeight,
    patternWidth,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  } = Object.assign(defaultProps, props);

  const bg = BackgroundCanvas({
    width: canvasWidth,
    height: canvasHeight,
    patternWidth: patternWidth,
    patternHeight: patternHeight,
    patternColor,
  });

  const fg = ForegroundCanvas({
    fillColor: foregroundColor,
    width: canvasWidth,
    height: canvasHeight,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  });

  const container = document.createElement('div');
  container.className = 'canvas-container';
  container.appendChild(bg.el);
  container.appendChild(fg.el);

  return {
    el: container,
    getForegroundContext() {
      return fg.context;
    },
    updateForegroundFill(fillColor) {
      fg.updateFillColor(fillColor);
    },
  };
}
