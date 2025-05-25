export class BlurCanvas {
  constructor(text) {
    this.text       = text
    this.fontSize   = 16
    this.lineHeight = this.fontSize * 1.5
    this.marginX    = 20

    this.init() // 初期化実行
  }

  get root_elm() {
    return document.querySelector(`.view`)
  }

  init() {
    this.create_canvas_context()

    const lines = this.getWrappedLines(this.text, this.maxWidth)

    // ★ 必要な高さを計算して canvas を再設定（ここで高さ確定）
    const requiredHeight = lines.length * this.lineHeight + 20
    this.canvas.height = requiredHeight;

    // ★ フォントとスタイルを再設定（canvas 再生成後の初期化必須）
    this.ctx.font = `${this.fontSize}px serif`;
    this.ctx.fillStyle = '#000';

    this.draw_lines(lines);
  }

  create_canvas_context() {
    const canvas = document.createElement("canvas");
    canvas.classList.add("blur-text");

    const width = this.root_elm.scrollWidth;
    this.maxWidth = width - this.marginX * 2;

    canvas.width = width;
    canvas.height = 100; // 仮置き（後で変更）

    this.root_elm.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.ctx.font = `${this.fontSize}px serif`
    this.ctx.fillStyle = '#000'
  }

  getWrappedLines(text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let line = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const width = this.ctx.measureText(testLine).width;

      if (width > maxWidth && line !== '') {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }

    if (line) lines.push(line);
    return lines;
  }

  draw_lines(lines) {
    const x = this.marginX;
    let line_num = 0
    lines.forEach((line, i) => {
      const y = this.lineHeight * (i + 1);
      if(line_num >= 5){
        this.ctx.filter = `blur(5px)`
      }
      line_num++
      this.ctx.fillText(line, x, y);
    });
  }
}