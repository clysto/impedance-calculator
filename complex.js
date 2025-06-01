export default class Complex {
  constructor(re, im = 0) {
    this.re = re;
    this.im = im;
  }

  static add(a, b) {
    a = a instanceof Complex ? a : new Complex(a);
    b = b instanceof Complex ? b : new Complex(b);
    return new Complex(a.re + b.re, a.im + b.im);
  }

  static sub(a, b) {
    a = a instanceof Complex ? a : new Complex(a);
    b = b instanceof Complex ? b : new Complex(b);
    return new Complex(a.re - b.re, a.im - b.im);
  }

  static mul(a, b) {
    a = a instanceof Complex ? a : new Complex(a);
    b = b instanceof Complex ? b : new Complex(b);
    return new Complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  }

  static div(a, b) {
    a = a instanceof Complex ? a : new Complex(a);
    b = b instanceof Complex ? b : new Complex(b);
    const denom = b.re * b.re + b.im * b.im;
    return new Complex(
      (a.re * b.re + a.im * b.im) / denom,
      (a.im * b.re - a.re * b.im) / denom
    );
  }

  static inv(a) {
    a = a instanceof Complex ? a : new Complex(a);
    const denom = a.re * a.re + a.im * a.im;
    return new Complex(a.re / denom, -a.im / denom);
  }

  static abs(a) {
    a = a instanceof Complex ? a : new Complex(a);
    return Math.sqrt(a.re * a.re + a.im * a.im);
  }

  static arg(a) {
    a = a instanceof Complex ? a : new Complex(a);
    return Math.atan2(a.im, a.re);
  }
}
