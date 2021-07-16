import './menu.css';

import {IconButton} from './components/Button';
import {ColorPicker} from './components/ColorPicker';
import {
  NumberPickerThing,
  IconNumberPickerThing,
} from './components/NumberPicker';

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
    defaultPaperColor: '#FFFFFF',
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
    onBrushChange,
    onBrushSizeChange,
    defaultPaperColor,
    onBrushColorChange,
    onPaperColorChange,
    onFillButtonClick,
    onDropProbabilityChange,
    onClearButtonClick,
    onClear10ButtonClick,
  } = Object.assign(defaultProps, props);

  // Menu list items for brushes (draw and erase)
  const brushColorPicker = ColorPicker('brush', {
    defaultValue: defaultBrushColor,
    onChange(event) {
      const target = event.currentTarget;
      onBrushColorChange(target.value);
    },
  });
  const drawButton = IconButton({
    id: 'drawButton',
    title: 'Draw',
    variant: 'draw',
    onClick: () => {
      drawButton.activateButton();
      eraseButton.deactivateButton();
      onBrushChange('draw');
    },
  });
  drawButton.activateButton();
  const eraseButton = IconButton({
    id: 'eraseButton',
    title: 'Erase',
    variant: 'eraser',
    onClick: () => {
      drawButton.deactivateButton();
      eraseButton.activateButton();
      onBrushChange('erase');
    },
  });
  const brushSizePicker = NumberPickerThing({
    id: 'brushSizeRange',
    label: 'Brush size',
    defaultValue: 1,
    minValue: 1,
    maxValue: 32,
    units: 'px',
    onChange(event) {
      onBrushSizeChange(event.target.value);
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
  const fillButton = IconButton({
    id: 'fillButton',
    title: 'Fill',
    variant: 'color-fill',
    onClick: onFillButtonClick,
  });
  const clearButton = IconNumberPickerThing({
    id: 'clearButton',
    label: 'Clear prob',
    title: 'Clear',
    iconVariant: 'clear',
    defaultValue: 100,
    minValue: 1,
    maxValue: 100,
    step: 1,
    units: '%',
    onClick: onClearButtonClick,
    onChange(event) {
      onDropProbabilityChange(event.target.value / 100);
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
