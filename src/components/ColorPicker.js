export function ColorPicker(name, props = {}) {
  const defaultProps = {
    defaultValue: '#000000',
    onChange() {},
  };
  const {defaultValue, onChange} = Object.assign(defaultProps, props);

  const el = document.createElement('input');
  el.type = 'color';
  el.className = 'input-control input-control-color';
  el.id = `color-${name}`;
  el.value = defaultValue;
  el.alt = `${name} color`;
  el.title = `${name} color`;
  el.addEventListener('change', onChange);
  return {el, name};
}
