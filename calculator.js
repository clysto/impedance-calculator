import Complex from './complex.js';

export function capacitorY(freq, c) {
  const w = 2 * Math.PI * freq;
  return new Complex(0, w * c);
}

export function capacitorZ(freq, c) {
  return Complex.div(1, capacitorY(freq, c));
}

export function inductorY(freq, l) {
  return Complex.div(1, inductorZ(freq, l));
}

export function inductorZ(freq, l) {
  const w = 2 * Math.PI * freq;
  return new Complex(0, w * l);
}

export function computeImpedances(network, zl, freq, directions = []) {
  const zArr = [zl];
  network.forEach((elem) => {
    if (elem.orientation === 'series') {
      if (elem.type === 'capacitor') {
        zArr.push(
          Complex.add(zArr[zArr.length - 1], capacitorZ(freq, elem.value))
        );
        directions.push("R'");
      } else if (elem.type === 'inductor') {
        zArr.push(
          Complex.add(zArr[zArr.length - 1], inductorZ(freq, elem.value))
        );
        directions.push('R');
      }
    } else {
      if (elem.type === 'capacitor') {
        zArr.push(
          Complex.div(
            1,
            Complex.add(
              Complex.div(1, zArr[zArr.length - 1]),
              capacitorY(freq, elem.value)
            )
          )
        );
        directions.push('G');
      } else if (elem.type === 'inductor') {
        zArr.push(
          Complex.div(
            1,
            Complex.add(
              Complex.div(1, zArr[zArr.length - 1]),
              inductorY(freq, elem.value)
            )
          )
        );
        directions.push("G'");
      }
    }
  });
  return zArr;
}
