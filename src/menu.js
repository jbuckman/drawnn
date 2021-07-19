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

export default function Menu(props = {}) {
  const defaultProps = {
    defaultBrush: 'paint',
    defaultBrushColor: '#000000',
    defaultPaperColor: '#ffffff',
    onBrushChange() {},
    onBrushSizeChange() {},
    onBrushColorChange() {},
    onPaperColorChange() {},
    onClearButtonClick() {},
    onDropProbabilityChange() {},
    onFillButtonClick() {},
  };
  const {
    defaultBrush,
    defaultBrushColor,
    defaultPaperColor,
    onBrushChange,
    onBrushSizeChange,
    onBrushColorChange,
    onPaperColorChange,
    onFillButtonClick,
    onDropProbabilityChange,
    onClearButtonClick,
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

  const menuListBrush = MenuList({
    menuItems: [brushColorPicker, drawButton, eraseButton, brushSizePicker],
  });

  const menuListPaint = MenuList({
    menuItems: [paperColorPicker, fillButton, clearButton],
  });

  const container = document.createElement('div');
  container.className = 'canvas-menu';
  container.appendChild(menuListBrush.el);
  container.appendChild(menuListPaint.el);

  return {el: container};
}
