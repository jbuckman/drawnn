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
    defaultValue: 'basic',
    options: ['basic', 'eraser'],
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
  el.alt = 'brush type';
  el.title = 'brush type';
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
    defaultBrush: 'basic',
    defaultBrushColor: '#000000',
    defaultPaperColor: '#ffffff',
    onBrushChange() {},
    onBrushColorChange() {},
    onPaperColorChange() {},
    onClearButtonClick() {},
  };
  const {
    defaultBrush,
    defaultBrushColor,
    defaultPaperColor,
    onBrushChange,
    onBrushColorChange,
    onPaperColorChange,
    onClearButtonClick,
  } = Object.assign(defaultProps, props);

  const brushColorPicker = ColorPicker('brush', {
    defaultValue: defaultBrushColor,
    onChange: onBrushColorChange,
  });
  const paperColorPicker = ColorPicker('paper', {
    defaultValue: defaultPaperColor,
    onChange: onPaperColorChange,
  });
  const brushPicker = BrushPicker({
    defaultValue: defaultBrush,
    onChange: onBrushChange,
  });
  const clearButton = Button({
    textContent: 'fill / clear',
    onClick: onClearButtonClick,
  });
  const menuList = MenuList({
    menuItems: [brushPicker, brushColorPicker, paperColorPicker, clearButton],
  });

  const container = document.createElement('div');
  container.className = 'canvas-menu';
  container.appendChild(menuList.el);

  return {el: container};
}
