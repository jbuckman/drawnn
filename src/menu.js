import './menu.css';

function ColorPicker(name, props = {}) {
  const defaultProps = {
    defaultValue: '#000000',
    onChange() {},
  };
  const {defaultValue, onChange} = Object.assign(defaultProps, props);

  let el = document.createElement('input');
  el.type = 'color';
  el.id = `color-${name}`;
  el.value = defaultValue;
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
  options.forEach(value => {
    let option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    el.appendChild(option);
  });

  el.id = `brush-picker`;
  el.value = defaultValue;
  el.addEventListener('change', onChange);

  return {el};
}

function MenuList(props = {}) {
  const defaultProps = {
    menuItems: [],
  };
  const {menuItems} = Object.assign(defaultProps, props);
  let el = document.createElement('ul');

  menuItems.forEach(item => {
    let li = document.createElement('li');
    li.appendChild(item.el);
    if (item.name) {
      let label = document.createElement('label');
      label.htmlFor = item.el.id;
      label.textContent = item.name;
      li.appendChild(label);
    }
    el.appendChild(li);
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
  };
  const {
    defaultBrush,
    defaultBrushColor,
    defaultPaperColor,
    onBrushChange,
    onBrushColorChange,
    onPaperColorChange,
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
  const menuList = MenuList({
    menuItems: [brushColorPicker, paperColorPicker, brushPicker],
  });

  const container = document.createElement('div');
  container.className = 'canvas-menu';
  container.appendChild(menuList.el);

  return {el: container};
}
