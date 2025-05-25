

export class Canvas{
  setting = {
    selector         : null,
    text             : "",
    font_size        : 16,
    line_height      : null,
    padding          : 10,
    text_color       : "#000",
    text_path        : "sample.txt",
    height           : "auto",
    font_family      : "serif",
    font_weight      : null,
    font_style       : null,
    font_variant     : null,
  }
  canvas = null

  constructor(options){
    this.options = Object.assign(this.setting, options)
    this.options.line_height = this.options.line_height || this.options.font_size * 1.5
    this.init()
    this.set_event()
  }
  
  async init(){
    this.canvas = this.set_canvas(this.options.selector)
    if(!this.canvas){return}
    this.text  = await this.load_text()
    this.set_canvas_size()
    this.view()
  }

  view(){
    const long_lines = this.get_wrapper_lines()
    const short_lines = this.get_range_lines(long_lines)

    const lines = this.setting.height === "auto" ? long_lines : short_lines
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
    this.ctx.font      = this.get_font()
  }

  get_font(){
    // return `${this.setting.font_weight} ${this.setting.font_size}px ${this.setting.font_family}`
    let fonts = []
    if(this.setting.font_style){
      fonts.push(this.setting.font_style)
    }
    if(this.setting.font_variant){
      fonts.push(this.setting.font_variant)
    }
    if(this.setting.font_weight){
      fonts.push(this.setting.font_weight)
    }
    fonts.push(`${this.setting.font_size}px`)
    fonts.push(this.setting.font_family)
    return fonts.join(" ")
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
    const max_width  = this.canvas.width  - (this.setting.padding * 2)
    const lines      = []
    const paragraphs = this.text.split('\n')
    for(const paragraph of paragraphs){
      let words = paragraph.split('')
      let line = ``
      const sub_lines = []
      let num_lines = 0
      for(const word of words){
        sub_lines[num_lines] = sub_lines[num_lines] || ""
        const testLine = sub_lines[num_lines] + word
        const width = this.ctx.measureText(testLine).width
        if(width > max_width && line !== ''){
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
          x    : this.setting.padding,
          // y    : this.setting.line_height * (lines.length + 1) + this.setting.padding,
          y    : this.setting.line_height * (lines.length + 1) + this.setting.padding - (this.setting.line_height - this.setting.font_size) / 2,
        })
      }
    }
    return lines
  }

  // 最大値ないのline情報を取得（最大値オーバーを除外）
  get_range_lines(lines){
    const maxHeight  = this.canvas.height - (this.setting.padding * 2)
    // const maxHeight  = this.setting.line_height * (lines.length + 1) - (this.setting.padding * 2)
    const maxLines   = Math.floor(maxHeight / this.setting.line_height)
    const datas = []
    for(let i=0; i<lines.length; i++){
      let text = lines[i].text
      if(datas.length +1 >= maxLines){
        lines[i].text = text.split('').slice(0,-1).join('') + "..."
        datas.push(lines[i])
        break
      }
      else{
        datas.push(lines[i])
      }
    }
    return datas;
  }

  reset_canvas(lines){
    // ★ 必要な高さを計算して canvas を再設定（ここで高さ確定）
    if(this.setting.height === "auto"){
      this.canvas.height = lines.length * this.setting.line_height + (this.setting.padding * 2)
    }
    else if(this.canvas.height < this.canvas.offsetHeight){
      this.canvas.height = lines.length * this.setting.line_height + (this.setting.padding * 2)
    }
    // ★ フォントとスタイルを再設定（canvas 再生成後の初期化必須）
    // this.ctx.font      = this.setting.font_size + `px serif`
    this.ctx.font      = this.get_font()
    this.ctx.fillStyle = this.setting.text_color
  }

  draw_lines(lines) {
    for(const line of lines){
      this.ctx.fillText(line.text, line.x, line.y)
    }
  }
}