/**
 * @param {HTMLElement} container
 * @param {string} groupName
 * @param {Array<{ id: string, name: string, sub?: string, swatch?: string, disabled?: boolean }>} items
 * @param {(id: string) => void} onSelect
 * @param {{ listClass?: string }} [options]
 */
export function renderChoices(container, groupName, items, onSelect, options = {}) {
  if (options.listClass) container.className = options.listClass;

  container.replaceChildren(
    ...items.map((item) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'choice-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = groupName;
      input.id = `${groupName}-${item.id}`;
      input.value = item.id;
      input.disabled = Boolean(item.disabled);

      const label = document.createElement('label');
      label.htmlFor = input.id;

      const body = document.createElement('div');
      body.className = 'choice-option__body';

      if (item.swatch) {
        wrapper.classList.add('choice-option--swatch');
        const swatch = document.createElement('span');
        swatch.className = 'choice-option__swatch';
        swatch.style.background = item.swatch;
        body.appendChild(swatch);
      }

      const name = document.createElement('span');
      name.className = 'choice-option__name';
      name.textContent = item.name;
      body.appendChild(name);

      if (item.sub) {
        const sub = document.createElement('span');
        sub.className = 'choice-option__sub';
        sub.textContent = item.sub;
        body.appendChild(sub);
      }

      label.appendChild(body);

      input.addEventListener('change', () => {
        if (input.checked && !item.disabled) onSelect(item.id);
      });

      wrapper.append(input, label);
      return wrapper;
    }),
  );
}

/** @param {string} groupName @param {string} id */
export function selectChoice(groupName, id) {
  const input = /** @type {HTMLInputElement | null} */ (
    document.querySelector(`#${groupName}-${id}`)
  );
  if (input) input.checked = true;
}
