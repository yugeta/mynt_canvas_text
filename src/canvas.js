

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
    this.set_event()
  }
  
  async init(){
    this.canvas = this.set_canvas(this.options.selector)
    if(!this.canvas){return}
    this.set_canvas_size()
    this.text  = await this.load_text()
    this.view()
  }

  view(){
    const lines = this.get_wrapper_lines()
    this.reset_canvas(lines)
    this.clear_canvas()
    this.draw_lines(lines)
  }

  set_event(){
    window.addEventListener("resize", this.resize_window.bind(this))
  }

  resize_window(){
    if(!this.canvas){return}
    this.set_canvas_size()
    this.view()
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

  clear_canvas(){
    if(!this.canvas){return}
    this.canvas.getContext("2d").clearRect(
      0, 0, 
      this.canvas.width, 
      this.canvas.height,
    )
  }

  create_canvas_context(target) {
    if(!target){return}
    const canvas = document.createElement("canvas");
    target.appendChild(canvas);
    return canvas
  }

  set_canvas_size(){
    this.canvas.width  = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
    this.ctx           = this.canvas.getContext("2d")
    this.ctx.font      = this.setting.font_size + `px serif`
  }

  async load_text(){
    if(!this.setting.text_path){return}
    const res = await fetch(this.setting.text_path, {
      method: "GET"
    })
    .then((res)=>{return res.text()})
    return res
  }

  // 行毎のテキストとx,y座標を取得
  get_wrapper_lines() {
    const text       = this.text
    const max_width  = this.canvas.width  - (this.setting.padding * 2)
    const maxHeight  = this.canvas.height - (this.setting.padding * 2)
    const maxLines   = Math.floor(maxHeight / this.setting.line_height)
    const lines      = []
    const paragraphs = text.split('\n')
    let num          = 1
    for (const paragraph of paragraphs) {
      let words = paragraph.split('')
      let line = ``
      const sub_lines = []
      let num_lines = 0
      for (const word of words) {
        sub_lines[num_lines] = sub_lines[num_lines] || ""
        const testLine = sub_lines[num_lines] + word
        const width = this.ctx.measureText(testLine).width
        if (width > max_width && line !== '') {
          num_lines++
          line = word
        } 
        else {
          line = testLine
        }
        sub_lines[num_lines] = line
      }
      for(const sub_line of sub_lines){
        lines.push({
          text : sub_line,
          x : this.setting.padding,
          y : this.setting.line_height * num + this.setting.padding,
        })
        num++
        if(lines.length >= maxLines){break}
      }
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
    for(const line of lines){
      this.ctx.fillText(line.text, line.x, line.y)
    }
  }
}