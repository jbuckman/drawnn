import './menu.css';

function ColorPicker(name, props = {}) {
  const defaultProps = {
    defaultValue: '#000000',
    onChange() {},
  };
  const {defaultValue, onChange} = Object.assign(defaultProps, props);

  let el = document.createElement('input');
  el.type = 'color';
  el.className = 'input-control input-control-color';
  el.id = `color-${name}`;
  el.value = defaultValue;
  el.alt = `${name} color`;
  el.title = `${name} color`;
  el.addEventListener('change', onChange);
  return {
    el,
    name,
  };
}

function BrushPicker(props = {}) {
  const defaultProps = {
    defaultValue: 'paint',
    options: ['paint', 'erase'],
    onChange() {},
  };
  const {defaultValue, onChange, options} = Object.assign(defaultProps, props);

  let el = document.createElement('select');
  el.className = 'select-control';
  options.forEach(value => {
    let option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    el.appendChild(option);
  });

  el.id = 'brush-picker';
  el.value = defaultValue;
  el.alt = 'brush mode';
  el.title = 'brush mode';
  el.addEventListener('change', onChange);

  return {el};
}

function Button(props = {}) {
  const defaultProps = {
    textContent: '',
    onClick() {},
  };
  const {textContent, onClick} = Object.assign(defaultProps, props);

  let el = document.createElement('button');
  el.className = 'btn btn-outline';
  el.textContent = textContent;
  el.alt = textContent;
  el.title = textContent;
  el.addEventListener('click', onClick);

  return {el};
}

function MenuList(props = {}) {
  const defaultProps = {
    menuItems: [],
  };
  const {menuItems} = Object.assign(defaultProps, props);
  let el = document.createDocumentFragment();

  menuItems.forEach(item => {
    el.appendChild(item.el);
  });

  return {el};
}

export default function Menu(props = {}) {
  const defaultProps = {
    defaultBrush: 'paint',
    defaultColor: '#000000',
    onBrushChange() {},
    onColorChange() {},
    onClearButtonClick() {},
    onFillButtonClick() {},
    onClear10ButtonClick() {},
  };
  const {
    defaultBrush,
    defaultColor,
    onBrushChange,
    onColorChange,
    onFillButtonClick,
    onClearButtonClick,
    onClear10ButtonClick,
  } = Object.assign(defaultProps, props);

  const colorPicker = ColorPicker('brush', {
    defaultValue: defaultColor,
    onChange: onColorChange,
  });
  const brushPicker = BrushPicker({
    defaultValue: defaultBrush,
    onChange: onBrushChange,
  });
  const fillButton = Button({
    textContent: 'fill',
    onClick: onFillButtonClick,
  });
  const clearButton = Button({
    textContent: 'clear',
    onClick: onClearButtonClick,
  });
  const clear10Button = Button({
    textContent: 'fuzz',
    onClick: onClear10ButtonClick,
  });
  const menuList = MenuList({
    menuItems: [
      brushPicker,
      colorPicker,
      fillButton,
      clearButton,
      clear10Button,
    ],
  });

  const container = document.createElement('div');
  container.className = 'canvas-menu';
  container.appendChild(menuList.el);

  return {el: container};
}
