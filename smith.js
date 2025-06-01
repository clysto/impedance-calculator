import Complex from './complex.js';

export const TAB10COLORS = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

export default class SmithChart {
  constructor(canvas) {
    this.canvas = canvas;
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = canvas.getContext('2d');

    // Retina scaling
    const dpr = window.devicePixelRatio || 1;
    this.width = canvas.width;
    this.height = canvas.height;

    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    canvas.style.width = this.width + 'px';
    canvas.style.height = this.height + 'px';

    this.ctx.scale(dpr, dpr);

    this.padding = 50;
    this.update();
  }

  rx2xy(r, x) {
    const denom = Math.pow(r + 1, 2) + Math.pow(x, 2);
    const re = (Math.pow(r, 2) + Math.pow(x, 2) - 1) / denom;
    const im = (2 * x) / denom;
    return [re, im];
  }

  xy2canvas(x, y) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const scale = this.width / 2 - this.padding;

    const canvasX = centerX + x * scale;
    const canvasY = centerY - y * scale; // y轴反转
    return [canvasX, canvasY];
  }

  gb2rx(g, b) {
    const denom = Math.pow(g, 2) + Math.pow(b, 2);
    return [g / denom, -b / denom];
  }

  rx2gb(r, x) {
    return this.gb2rx(r, x);
  }

  clipCircle() {
    this.ctx.beginPath();
    this.ctx.arc(
      this.width / 2,
      this.height / 2,
      this.width / 2 - this.padding,
      0,
      Math.PI * 2
    );
    this.ctx.clip();
  }

  drawText(
    x,
    y,
    text,
    size = 16,
    color = '#000',
    bgColor = null,
    rotated = false
  ) {
    const [canvasX, canvasY] = this.xy2canvas(x, y);

    this.ctx.font = `${size}px DejaVu Sans`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = size; // approximate text height

    this.ctx.save();
    this.ctx.translate(canvasX, canvasY);
    if (rotated) {
      this.ctx.rotate(-Math.PI / 2);
    }
    if (bgColor) {
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(
        -textWidth / 2 - 2,
        -textHeight / 2 - 2,
        textWidth + 4,
        textHeight + 4
      );
    }
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }

  drawArc(x, y, r, startAngle, endAngle, width = 1, color = '#000') {
    const scale = this.width / 2 - this.padding;
    const [canvasX, canvasY] = this.xy2canvas(x, y);
    const canvasR = r * scale;

    this.ctx.save();
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(canvasX, canvasY, canvasR, startAngle, endAngle);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawMarker(x, y, size = 5, color = '#000') {
    const [canvasX, canvasY] = this.xy2canvas(x, y);
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(canvasX, canvasY, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawAxes() {
    this.ctx.save();
    [0.3, 0.6, 1, 1.5, 2.5, 6].forEach((x) => {
      this.drawXCircle(x, 1, '#aaa');
      this.drawXCircle(-x, 1, '#aaa');
    });
    [0.1, 0.3, 0.6, 1, 1.5, 2.4, 4.4, 13].forEach((r) => {
      this.drawRCircle(r, 1, '#aaa');
    });
    this.ctx.beginPath();
    this.drawArc(0, 0, 1, 0, Math.PI * 2, 2); // Outer circle
    this.ctx.moveTo(this.padding, this.height / 2);
    this.ctx.lineTo(this.width - this.padding, this.height / 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawLabels() {
    [0.1, 0.3, 0.6, 1, 1.5, 2.4, 4.4, 13].forEach((r) => {
      this.drawText(
        (r - 1) / (r + 1),
        0,
        r.toFixed(1),
        14,
        '#000',
        '#fff',
        true
      );
    });
    let scale = 25 / (this.width / 2 - this.padding);
    [0.3, 0.6, 1, 1.5, 2.5, 6].forEach((xx) => {
      let [x, y] = this.rx2xy(0, xx);
      let norm = Math.sqrt(x * x + y * y);
      x += (x / norm) * scale;
      y += (y / norm) * scale;
      this.drawText(x, y, `${xx}j`, 14, '#000');
      this.drawText(x, -y, `${-xx}j`, 14, '#000');
    });
    this.drawText(-1 - scale, 0, '0', 14, '#000');
    this.drawText(1 + scale, 0, '∞', 14, '#000');
  }

  drawRCircle(r, width = 1, color = '#000') {
    this.ctx.save();
    this.clipCircle();
    this.drawArc(r / (r + 1), 0, 1 / (r + 1), 0, Math.PI * 2, width, color); // R circle
    this.ctx.restore();
  }

  drawXCircle(x, width = 1, color = '#000') {
    this.ctx.save();
    this.clipCircle();
    this.drawArc(1, 1 / x, Math.abs(1 / x), 0, Math.PI * 2, width, color); // X circle
    this.ctx.restore();
  }

  drawGCircle(g, width = 1, color = '#000') {
    this.ctx.save();
    this.clipCircle();
    this.drawArc(-g / (g + 1), 0, 1 / (g + 1), 0, Math.PI * 2, width, color); // G circle
    this.ctx.restore();
  }

  drawBCircle(b, width = 1, color = '#000') {
    this.ctx.save();
    this.clipCircle();
    this.drawArc(-1, 1 / b, Math.abs(1 / b), 0, Math.PI * 2, width, color); // B circle
    this.ctx.restore();
  }

  drawGArcTo(g, bFrom, bTo, width = 1, color = '#000', reverse = false) {
    const centerX = -g / (g + 1);
    const centerY = 0;
    const radius = 1 / (g + 1);

    const [x1, y1] = this.rx2xy(...this.gb2rx(g, bFrom));
    const [x2, y2] = this.rx2xy(...this.gb2rx(g, bTo));

    let startAngle = -Math.atan2(y1 - centerY, x1 - centerX);
    let endAngle = -Math.atan2(y2 - centerY, x2 - centerX);

    if (reverse) {
      const tmp = startAngle;
      startAngle = endAngle;
      endAngle = tmp;
    }

    this.drawArc(centerX, centerY, radius, startAngle, endAngle, width, color);
  }

  drawRArcTo(r, xFrom, xTo, width = 1, color = '#000', reverse = false) {
    const centerX = r / (r + 1);
    const centerY = 0;
    const radius = 1 / (r + 1);

    const [x1, y1] = this.rx2xy(r, xFrom);
    const [x2, y2] = this.rx2xy(r, xTo);

    let startAngle = -Math.atan2(y1 - centerY, x1 - centerX);
    let endAngle = -Math.atan2(y2 - centerY, x2 - centerX);

    if (reverse) {
      const tmp = startAngle;
      startAngle = endAngle;
      endAngle = tmp;
    }

    this.drawArc(centerX, centerY, radius, startAngle, endAngle, width, color);
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawAxes();
    this.drawLabels();
  }

  drawImpeancesTrace(zArr, directions) {
    const zl = Complex.div(zArr[0], 50);
    for (let i = 1; i < zArr.length; i++) {
      const prevZ = Complex.div(zArr[i - 1], 50);
      const z = Complex.div(zArr[i], 50);
      const dir = directions[i - 1];
      const color = TAB10COLORS[(i - 1) % TAB10COLORS.length];

      if (dir.startsWith('R')) {
        this.drawRArcTo(prevZ.re, prevZ.im, z.im, 3, color, dir.endsWith("'"));
      } else if (dir.startsWith('G')) {
        this.drawGArcTo(
          ...this.rx2gb(prevZ.re, prevZ.im),
          this.rx2gb(z.re, z.im)[1],
          3,
          color,
          dir.endsWith("'")
        );
      }
      this.drawMarker(
        ...this.rx2xy(prevZ.re, prevZ.im),
        8,
        TAB10COLORS[(i - 2) % TAB10COLORS.length]
      );
      if (i === zArr.length - 1) {
        this.drawMarker(...this.rx2xy(z.re, z.im), 8, color);
      }
    }

    let [x, y] = this.rx2xy(zl.re, zl.im);
    this.drawMarker(x, y, 8, '#f00');
  }
}
