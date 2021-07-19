export function NumberPicker(props = {}) {
  const defaultProps = {
    label: '',
    defaultValue: 0,
    toggleEl: null,
    minValue: 0,
    maxValue: 100,
    step: 1,
    units: '',
    onChange() {},
  };
  const {
    label,
    id,
    toggleEl,
    defaultValue,
    minValue,
    maxValue,
    step,
    units,
    onChange,
  } = Object.assign(defaultProps, props);

  if (id == null) throw new Error('Invalid input: id required');

  const menuTemplate = `\
      <ul
        class="dropdown-menu range-menu"
        aria-labelledby="${id}_Toggle"
      >
        <li>
          <label for="${id}_Input" class="form-label">
            ${label}: <span id="${id}_Label">${defaultValue}${units}</span>
          </label>
          <input
            type="range"
            class="form-range"
            min="${minValue}"
            max="${maxValue}"
            step="${step}"
            value="${defaultValue}"
            id="${id}_Input"
          >
        </li>
      </ul>
    `;

  const el = document.createElement('div');
  el.className = 'dropdown';
  el.alt = label;
  el.title = label;
  el.innerHTML = menuTemplate;
  el.prepend(toggleEl);

  const valueLabel = el.querySelector(`#${id}_Label`);
  el.addEventListener('input', event => {
    valueLabel.textContent = `${event.target.value}${units}`;
  });
  el.addEventListener('change', onChange);

  return {el};
}
