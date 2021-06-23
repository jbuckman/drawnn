import './menu.css';

const defaultPickerProps = {
  defaultValue: '#000',
  onChange() {},
};

function ColorPicker(name, props = defaultPickerProps) {
  const {onChange} = Object.assign(defaultPickerProps, props);
  let el = document.createElement('input');
  el.type = 'color';
  el.id = `color-${name}`;
  el.value = props.defaultValue;
  el.addEventListener('change', onChange);
  return {
    el,
    name,
  };
}

const defaultMenuListProps = {
  menuItems: [],
};

function MenuList(props = defaultMenuListProps) {
  const {menuItems} = Object.assign(defaultMenuListProps, props);
  let el = document.createElement('ul');

  menuItems.forEach(item => {
    let li = document.createElement('li');
    let label = document.createElement('label');
    label.htmlFor = item.el.id;
    label.textContent = item.name;
    li.appendChild(item.el);
    li.appendChild(label);
    el.appendChild(li);
  });

  return {
    el,
  };
}

const defaultMenuProps = {
  defaultBrushColor: 'black',
  defaultPaperColor: 'red',
  onBrushColorChange() {},
  onPaperColorChange() {},
};

export default function Menu(props = defaultMenuProps) {
  const {
    defaultBrushColor,
    defaultPaperColor,
    onBrushColorChange,
    onPaperColorChange,
  } = Object.assign(defaultMenuProps, props);

  const brushColorPicker = ColorPicker('brush', {
    defaultValue: defaultBrushColor,
    onChange: onBrushColorChange,
  });
  const paperColorPicker = ColorPicker('paper', {
    defaultValue: defaultPaperColor,
    onChange: onPaperColorChange,
  });
  const menuList = MenuList({menuItems: [brushColorPicker, paperColorPicker]});

  const container = document.createElement('div');
  container.className = 'canvas-menu';
  container.appendChild(menuList.el);

  return {
    el: container,
  };
}
