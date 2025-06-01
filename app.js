import Complex from './complex.js';
import SmithChart, { TAB10COLORS } from './smith.js';
import { computeImpedances, matchImpedance } from './calculator.js';

const circuitDom = document.getElementById('circuit');
const canvas = document.getElementById('smith-chart');
const chart = new SmithChart(canvas);
const paramters = {
  frequency: 100e6,
  zl: new Complex(10, 30),
};

function humanReadable(value) {
  const absVal = Math.abs(value);
  if (absVal === 0) return [0, 1e-12, 'p'];
  if (absVal >= 1) return [value / 1, ''];
  if (absVal >= 1e-3) return [value / 1e-3, 1e-3, 'm'];
  if (absVal >= 1e-6) return [value / 1e-6, 1e-6, 'μ'];
  if (absVal >= 1e-9) return [value / 1e-9, 1e-9, 'n'];
  // for any remaining small value, default to 'p'
  return [value / 1e-12, 1e-12, 'p'];
}

function refreshCircuitColors() {
  const elements = Array.from(circuitDom.querySelectorAll('.element'));
  let index = 0;
  for (const element of elements) {
    const colorDiv = element.querySelector('.color');
    colorDiv.style.backgroundColor = TAB10COLORS[index % TAB10COLORS.length];
    index++;
  }
}

function addComponent({ type, value, orientation }) {
  const elementsLength = circuitDom.querySelectorAll('.element').length;
  const template = document
    .getElementById(`${type}-template-${orientation}`)
    .content.cloneNode(true);
  const humanValue = humanReadable(value);

  template.querySelector('input[name=value]').value = `${humanValue[0]}`;
  template.querySelector('select[name=unit]').value = humanValue[1];
  template.querySelector('.color').style.backgroundColor =
    TAB10COLORS[elementsLength % TAB10COLORS.length];

  const deleteButton = template.querySelector('button[name=delete]');
  const form = template.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCircuitChange();
  });
  form.addEventListener('change', handleCircuitChange);

  deleteButton.addEventListener('click', (e) => {
    e.preventDefault();
    const element = e.target.closest('.element');
    if (element) {
      element.remove();
      refreshCircuitColors();
      handleCircuitChange();
    }
  });
  circuitDom.appendChild(template);
}

function handleCircuitChange() {
  const elements = Array.from(circuitDom.querySelectorAll('.element'));
  const network = [];
  for (const element of elements) {
    const valueInput = element.querySelector('input[name=value]');
    const unitSelect = element.querySelector('select[name=unit]');
    network.push({
      type: element.dataset.type,
      orientation: element.dataset.orientation,
      value: parseFloat(valueInput.value) * parseFloat(unitSelect.value),
    });
  }

  const directions = [];
  const zArr = computeImpedances(
    network,
    paramters.zl,
    paramters.frequency,
    directions
  );
  chart.update();
  chart.drawImpeancesTrace(zArr, directions);
}

function init() {
  document.querySelectorAll('.add-component-btn').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const type = e.target.dataset.type;
      const orientation = e.target.dataset.orientation;
      addComponent({ type, value: 0, orientation });
      handleCircuitChange();
    });
  });

  document.getElementById('paramters').addEventListener('change', (e) => {
    e.preventDefault();
    const frequencyInput = document.querySelector('input[name=frequency]');
    const zlRealInput = document.querySelector('input[name=load-real]');
    const zlImagInput = document.querySelector('input[name=load-imag]');

    paramters.frequency = parseFloat(frequencyInput.value) * 1e6; // Convert MHz to Hz
    paramters.zl = new Complex(
      parseFloat(zlRealInput.value),
      parseFloat(zlImagInput.value)
    );

    handleCircuitChange();
  });

  document.getElementById('calc-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const matchResults = matchImpedance(paramters.zl, 50, paramters.frequency);

    const elements = Array.from(circuitDom.querySelectorAll('.element'));
    elements.forEach((element) => element.remove());
    for (let element of matchResults[0]) {
      addComponent(element);
    }
    handleCircuitChange();
  });

  const network = matchImpedance(paramters.zl, 50, paramters.frequency)[0];

  for (const element of network) {
    addComponent(element);
  }

  const directions = [];
  const zArr = computeImpedances(
    network,
    paramters.zl,
    paramters.frequency,
    directions
  );
  chart.update();
  chart.drawImpeancesTrace(zArr, directions);
}

init();
