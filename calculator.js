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

export function matchImpedance(zl, z0, f) {
  const z = Complex.div(zl, z0);
  const networks = [];

  if (z.re < 1) {
    let x1 = -z.im + Math.sqrt(z.re * (1 - z.re));
    let x2 = -z.im - Math.sqrt(z.re * (1 - z.re));

    let net = [];
    if (x1 < 0) {
      // series capacitor
      const c = 1 / (-x1 * z0) / (2 * Math.PI * f);
      net.push({ type: 'capacitor', value: c, orientation: 'series' });
    } else {
      // series inductor
      const l = (x1 * z0) / (2 * Math.PI * f);
      net.push({ type: 'inductor', value: l, orientation: 'series' });
    }
    let x3 = Complex.sub(
      new Complex(1, 0),
      Complex.inv(Complex.add(z, new Complex(0, x1)))
    ).im;
    if (x3 < 0) {
      // shunt inductor
      const l = 1 / (-x3 / z0) / (2 * Math.PI * f);
      net.push({ type: 'inductor', value: l, orientation: 'shunt' });
    } else {
      // shunt capacitor
      const c = x3 / z0 / (2 * Math.PI * f);
      net.push({ type: 'capacitor', value: c, orientation: 'shunt' });
    }
    networks.push(net);

    net = [];
    if (x2 < 0) {
      // series capacitor
      const c = 1 / (-x2 * z0) / (2 * Math.PI * f);
      net.push({ type: 'capacitor', value: c, orientation: 'series' });
    } else {
      // series inductor
      const l = (x2 * z0) / (2 * Math.PI * f);
      net.push({ type: 'inductor', value: l, orientation: 'series' });
    }
    x3 = Complex.sub(
      new Complex(1, 0),
      Complex.inv(Complex.add(z, new Complex(0, x2)))
    ).im;
    if (x3 < 0) {
      // shunt inductor
      const l = 1 / (-x3 / z0) / (2 * Math.PI * f);
      net.push({ type: 'inductor', value: l, orientation: 'shunt' });
    } else {
      // shunt capacitor
      const c = x3 / z0 / (2 * Math.PI * f);
      net.push({ type: 'capacitor', value: c, orientation: 'shunt' });
    }
    networks.push(net);
  }

  if (Complex.div(1, z).re < 1) {
    const denom = z.re * z.re + z.im * z.im;
    let x1 = z.im / denom + Math.sqrt((z.re / denom) * (1 - z.re / denom));
    let x2 = z.im / denom - Math.sqrt((z.re / denom) * (1 - z.re / denom));
    let net = [];

    if (x1 < 0) {
      // shunt inductor
      const l = 1 / (-x1 / z0) / (2 * Math.PI * f);
      net.push({ type: 'inductor', value: l, orientation: 'shunt' });
    } else {
      // shunt capacitor
      const c = x1 / z0 / (2 * Math.PI * f);
      net.push({ type: 'capacitor', value: c, orientation: 'shunt' });
    }
    let x3 = Complex.sub(
      new Complex(1, 0),
      Complex.inv(Complex.add(Complex.inv(z), new Complex(0, x1)))
    ).im;
    if (x3 < 0) {
      // series capacitor
      const c = 1 / (-x3 * z0) / (2 * Math.PI * f);
      net.push({ type: 'capacitor', value: c, orientation: 'series' });
    } else {
      // series inductor
      const l = (x3 * z0) / (2 * Math.PI * f);
      net.push({ type: 'inductor', value: l, orientation: 'series' });
    }
    networks.push(net);

    net = [];
    if (x2 < 0) {
      // shunt inductor
      const l = 1 / (-x2 / z0) / (2 * Math.PI * f);
      net.push({ type: 'inductor', value: l, orientation: 'shunt' });
    } else {
      // shunt capacitor
      const c = x2 / z0 / (2 * Math.PI * f);
      net.push({ type: 'capacitor', value: c, orientation: 'shunt' });
    }
    x3 = Complex.sub(
      new Complex(1, 0),
      Complex.inv(Complex.add(Complex.inv(z), new Complex(0, x2)))
    ).im;
    if (x3 < 0) {
      // series capacitor
      const c = 1 / (-x3 * z0) / (2 * Math.PI * f);
      net.push({ type: 'capacitor', value: c, orientation: 'series' });
    } else {
      // series inductor
      const l = (x3 * z0) / (2 * Math.PI * f);
      net.push({ type: 'inductor', value: l, orientation: 'series' });
    }
    networks.push(net);
  }

  return networks;
}
