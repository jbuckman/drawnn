export function Button(props = {}) {
  const defaultProps = {
    className: '',
    content: '',
    label: '',
    onClick() {},
  };
  const {className, label, content, onClick} = Object.assign(
    defaultProps,
    props
  );

  const el = document.createElement('button');
  el.className = `btn btn-outline${className ? ' ' + className : ''}`;
  el.innerHTML = content;
  el.alt = label;
  el.title = label;
  el.addEventListener('click', onClick);

  return {
    el,
    addClass(className) {
      el.classList.add(className);
    },
    removeClass(className) {
      el.classList.remove(className);
    },
  };
}
