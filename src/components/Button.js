export function Button(props = {}) {
  const defaultProps = {
    className: '',
    textContent: '',
    label: '',
    onClick() {},
  };
  const {className, label, textContent, onClick} = Object.assign(
    defaultProps,
    props
  );

  const el = document.createElement('button');
  el.className = `btn btn-outline${className ? ' ' + className : ''}`;
  el.textContent = textContent;
  el.alt = label;
  el.title = label;
  el.addEventListener('click', onClick);

  return {el};
}

export function IconButton(props = {}) {
  const defaultProps = {
    variant: '',
    title: '',
    onClick() {},
  };
  const {variant, title, onClick} = Object.assign(defaultProps, props);

  const el = document.createElement('button');
  el.className = 'btn btn-outline';
  el.alt = title;
  el.title = title;
  el.innerHTML = `<svg class="icon" fill="currentColor"><use xlink:href="icons.svg#${variant}"></use></svg>`;
  el.addEventListener('click', onClick);

  return {
    el,
    activateButton() {
      el.classList.add('active');
    },
    deactivateButton() {
      el.classList.remove('active');
    },
  };
}
