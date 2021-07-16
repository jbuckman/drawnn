export function NumberPickerThing(props = {}) {
  const defaultProps = {
    label: '',
    defaultValue: 0,
    minValue: 0,
    maxValue: 100,
    step: 1,
    units: '',
    onChange() {},
  };
  const {label, id, defaultValue, minValue, maxValue, step, units, onChange} =
    Object.assign(defaultProps, props);

  if (id == null) throw new Error('Invalid input: id required');

  const template = `\
      <button
        class="btn btn-outline dropdown-toggle"
        id="${id}_Toggle"
        aria-expanded="false"
      >
        ${defaultValue}${units}
      </button>
      <ul
        class="dropdown-menu range-menu"
        aria-labelledby="${id}_Toggle"
      >
        <li>
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
  el.innerHTML = template;

  const btn = el.querySelector(`#${id}_Toggle`);
  el.addEventListener('input', event => {
    btn.textContent = `${event.target.value}${units}`;
  });
  el.addEventListener('change', onChange);

  return {el};
}

export function IconNumberPickerThing(props = {}) {
  const defaultProps = {
    label: '',
    title: '',
    iconVariant: '',
    defaultValue: 0,
    minValue: 0,
    maxValue: 100,
    step: 1,
    units: '',
    onChange() {},
    onClick() {},
  };
  const {
    id,
    label,
    title,
    iconVariant,
    defaultValue,
    minValue,
    maxValue,
    step,
    units,
    onChange,
    onClick,
  } = Object.assign(defaultProps, props);

  if (id == null) throw new Error('Invalid input: id required');

  const template = `\
      <button
        class="btn btn-outline dropdown-btn"
        id="${id}_Button"
        aria-expanded="false"
      >
        <svg class="icon" fill="currentColor">
          <use xlink:href="icons.svg#${iconVariant}"></use>
        </svg>
      </button>
      <ul class="dropdown-menu range-menu">
        <li>
          <label for="${id}_Input" class="form-label">
            ${label}: <span id="${id}_Value">${defaultValue}${units}</span>
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
  el.alt = title || label;
  el.title = title || label;
  el.innerHTML = template;

  const val = el.querySelector(`#${id}_Value`);
  el.addEventListener('input', event => {
    val.textContent = `${event.target.value}${units}`;
  });
  el.addEventListener('change', onChange);

  const btn = el.querySelector(`#${id}_Button`);
  btn.addEventListener('click', onClick);

  return {
    el,
    activateButton() {
      btn.classList.add('active');
    },
    deactivateButton() {
      btn.classList.remove('active');
    },
  };
}
