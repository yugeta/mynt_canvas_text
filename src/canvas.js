

export class Canvas{
  setting = {
    selector         : null,
    text             : "",
    font_size        : 16,
    line_height      : 24,
    padding          : 10,
    text_color       : "#000",
    text_path        : "sample.txt",
  }
  canvas = null

  constructor(options){
    this.options = Object.assign(this.setting, options)

    this.init()
  }
  
  async init(){
    this.canvas = this.set_canvas(this.options.selector)
    if(!this.canvas){return}
    const text  = await this.load_text()
    const lines = this.get_wrapper_lines(text)
    this.reset_canvas(lines)
    this.draw_lines(lines)
  }

  set_canvas(selector){
    const target = document.querySelector(selector)
    if(selector && target.tagName === "CANVAS"){
      return target
    }
    else{
      return this.create_canvas_context(target)
    }
  }

  create_canvas_context(target) {
    if(!target){return}
    const canvas = document.createElement("canvas");
    // this.maxWidth = width - this.marginX * 2;
    target.appendChild(canvas);
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    this.ctx      = canvas.getContext("2d")
    this.ctx.font = this.setting.font_size + `px serif`
    return canvas
  }

  async load_text(){
    if(!this.setting.text_path){return}
    const res = await fetch(this.setting.text_path, {
      method: "GET"
    })
    .then((res)=>{return res.text()})
    return res
  }

  get_wrapper_lines(text) {
    const max_width = this.canvas.width  - (this.setting.padding * 2)
    const maxHeight = this.canvas.height - (this.setting.padding * 2)
    const maxLines  = Math.floor(maxHeight / this.setting.line_height)
    const lines = []
    const paragraphs = text.split('\n');
    for (const paragraph of paragraphs) {
      let words = paragraph.split('')
      let line = ''
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const width = this.ctx.measureText(testLine).width

        if (width > max_width && line !== '') {
          lines.push(line)
          line = words[i]
        } 
        else {
          line = testLine
        }
      }
      if (line) lines.push(line)
      if(lines.length >= maxLines){break}
    }
    return lines;
  }

  reset_canvas(lines){
    // ★ 必要な高さを計算して canvas を再設定（ここで高さ確定）
    if(this.canvas.height < this.canvas.offsetHeight){
      this.canvas.height = lines.length * this.setting.line_height + 20
    }

    // ★ フォントとスタイルを再設定（canvas 再生成後の初期化必須）
    this.ctx.font      = this.setting.font_size + `px serif`
    this.ctx.fillStyle = this.setting.text_color
  }

  draw_lines(lines) {
    const x = this.setting.padding
    let line_num = 0
    lines.forEach((line, i) => {
      const y = this.setting.line_height * (i + 1) + this.setting.padding
      // const y = this.setting.font_size * (i + 1)
      // if(line_num >= 5){
      //   this.ctx.filter = `blur(5px)`
      // }
      line_num++
      this.ctx.fillText(line, x, y)
      // console.log(x,y,line)
    })
  }
}