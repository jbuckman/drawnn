import './menu.css';

import {Button} from './components/Button';
import {ColorPicker} from './components/ColorPicker';
import {NumberPicker} from './components/NumberPicker';

function MenuList(props = {}) {
  const defaultProps = {
    menuItems: [],
  };
  const {menuItems} = Object.assign(defaultProps, props);
  const el = document.createElement('div');
  el.className = 'menu-list';

  menuItems.forEach(item => {
    el.appendChild(item.el);
  });

  return {el};
}

function ResolutionSelect(props) {
  const defaultProps = {
    onChange() {},
  };

  const {onChange} = Object.assign(defaultProps, props);

  const el = document.createElement('select');
  el.className = 'select-control resolution-select';
  el.innerHTML = `\
    <option value="32">32x32</option>
    <option value="256" selected>256x256</option>
    <option value="1024">1024x1024</option>
  `;
  el.addEventListener('change', onChange);

  return {el};
}

export default function Menu(props = {}) {
  const defaultProps = {
    defaultBrushColor: '#000000',
    defaultPaperColor: '#FFFFFF',
    onBrushChange() {},
    onBrushSizeChange() {},
    onBrushColorChange() {},
    onClearButtonClick() {},
    onDropProbabilityChange() {},
    onFillButtonClick() {},
    onPaperColorChange() {},
    onRedoButtonClick() {},
    onResolutionChange() {},
    onUndoButtonClick() {},
  };
  const {
    defaultBrushColor,
    onBrushChange,
    onBrushSizeChange,
    defaultPaperColor,
    onBrushColorChange,
    onClearButtonClick,
    onDropProbabilityChange,
    onFillButtonClick,
    onResolutionChange,
    onRedoButtonClick,
    onPaperColorChange,
    onUndoButtonClick,
  } = Object.assign(defaultProps, props);

  const Icon = variant =>
    `<svg class="icon" fill="currentColor">
    <use xlink:href="icons.svg#${variant}"></use>
    </svg>`;

  // Menu list items for brushes (draw and erase)
  const brushColorPicker = ColorPicker('brush', {
    defaultValue: defaultBrushColor,
    onChange(event) {
      const target = event.currentTarget;
      onBrushColorChange(target.value);
    },
  });
  const drawButton = Button({
    id: 'drawButton',
    title: 'Draw',
    className: 'active',
    content: Icon('draw'),
    onClick: () => {
      drawButton.addClass('active');
      eraseButton.removeClass('active');
      onBrushChange('draw');
    },
  });
  const eraseButton = Button({
    id: 'eraseButton',
    title: 'Erase',
    content: Icon('eraser'),
    onClick: () => {
      drawButton.removeClass('active');
      eraseButton.addClass('active');
      onBrushChange('erase');
    },
  });
  const brushSizeToggle = Button({
    id: 'brushSizeToggle',
    title: 'Brush size',
    className: 'dropdown-toggle',
    content: '1px',
  });
  const brushSizePicker = NumberPicker({
    id: 'brushSizeRange',
    label: 'Brush size',
    toggleEl: brushSizeToggle.el,
    defaultValue: 1,
    minValue: 1,
    maxValue: 32,
    units: 'px',
    onChange(event) {
      const brushSize = Number(event.target.value);
      brushSizeToggle.el.textContent = `${brushSize}px`;
      onBrushSizeChange(brushSize);
    },
  });

  // Menu list items for canvas fill and clear
  const paperColorPicker = ColorPicker('paper', {
    defaultValue: defaultPaperColor,
    onChange(event) {
      const target = event.currentTarget;
      onPaperColorChange(target.value);
    },
  });
  const fillButton = Button({
    id: 'fillButton',
    title: 'Fill',
    content: Icon('color-fill'),
    onClick: onFillButtonClick,
  });
  const clearButtonToggle = Button({
    id: 'clearButtonToggle',
    title: 'Clear',
    content: Icon('clear'),
    onClick: onClearButtonClick,
  });
  const clearButton = NumberPicker({
    id: 'clearButton',
    label: 'Clear prob',
    title: 'Clear',
    toggleEl: clearButtonToggle.el,
    defaultValue: 100,
    minValue: 1,
    units: '%',
    onChange(event) {
      const dropProbability = Number(event.target.value);
      onDropProbabilityChange(dropProbability / 100);
    },
  });

  // Menu list items for canvas resolution, undo and redo
  const resolutionSelect = ResolutionSelect({onChange: onResolutionChange});
  const undoButton = Button({
    id: 'undoButton',
    title: 'Undo',
    content: Icon('undo'),
    onClick: onUndoButtonClick,
  });
  const redoButton = Button({
    id: 'redoButton',
    title: 'Redo',
    content: Icon('redo'),
    onClick: onRedoButtonClick,
  });

  const menuListBrush = MenuList({
    menuItems: [brushColorPicker, drawButton, eraseButton, brushSizePicker],
  });

  const menuListPaint = MenuList({
    menuItems: [paperColorPicker, fillButton, clearButton],
  });

  const menuListResolution = MenuList({
    menuItems: [resolutionSelect, undoButton, redoButton],
  });

  const container = document.createElement('div');
  container.className = 'canvas-menu';
  container.appendChild(menuListBrush.el);
  container.appendChild(menuListPaint.el);
  container.appendChild(menuListResolution.el);

  return {el: container,
    enableUndoButton() {
      undoButton.el.disabled = false;
    },
    disableUndoButton() {
      undoButton.el.disabled = true;
    },
    enableRedoButton() {
      redoButton.el.disabled = false;
    },
    disableRedoButton() {
      redoButton.el.disabled = true;
    },
  };
}
