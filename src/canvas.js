import { LoadText } from "./load_text.js"

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

  constructor(options){
    if(!options || !options.text){return}
    this.options = Object.assign(this.setting, options)
    // 文字表示幅のセット（指定がない場合は文字サイズの1.5倍）
    this.options.line_height = this.options.line_height || this.options.font_size * 1.5
    this.canvas = this.set_canvas(this.options.selector)
    this.set_canvas_size()
    this.view()
    this.set_event()
  }

  // 表示処理（再描画でも利用する）
  view(){
    const long_lines = this.get_wrapper_lines()
    const short_lines = this.get_range_lines(long_lines)
    const lines = this.setting.height === "auto" ? long_lines : short_lines
    this.reset_canvas(lines)
    this.clear_canvas()
    this.draw_lines(lines)
  }


  /**
   * Event
   */

  // イベント設定
  set_event(){
    // window.addEventListener("resize", this.resize_window.bind(this)) // windowサイズイベント利用
    const observer = new ResizeObserver(this.resize_window.bind(this))
    observer.observe(this.canvas)
  }

  // イベント処理 : windowリサイズ
  resize_window(){
    if(!this.canvas){return}
    this.set_canvas_size()
    this.view()
  }


  /**
   * Canvas
   */

  // 対象canvasの取得処理
  set_canvas(selector){
    const target = document.querySelector(selector)
    if(selector && target.tagName === "CANVAS"){
      return target
    }
    else{
      return this.create_canvas_context(target)
    }
  }

  // canvasの描画をクリアする（再描画処理用）
  clear_canvas(){
    if(!this.canvas){return}
    this.canvas.getContext("2d").clearRect(
      0, 0, 
      this.canvas.width, 
      this.canvas.height,
    )
  }

  // 指定selectorがcanvasじゃない場合は、createする
  create_canvas_context(target) {
    if(!target){return}
    const canvas = document.createElement("canvas");
    target.appendChild(canvas);
    return canvas
  }

  // canvasサイズのセット（リサイズ事にセットし直す）
  set_canvas_size(){
    this.canvas.width  = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
    this.ctx           = this.canvas.getContext("2d")
    this.ctx.font      = this.get_font()
  }

  // フォント設定も文字列作成
  get_font(){
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

  // canvasの再描画に必要なheightリサイズや、フォント設定処理
  reset_canvas(lines){
    // ★ 必要な高さを計算して canvas を再設定（ここで高さ確定）
    if(this.setting.height === "auto"){
      this.canvas.height = lines.length * this.setting.line_height + (this.setting.padding * 2)
    }
    else if(this.canvas.height < this.canvas.offsetHeight){
      this.canvas.height = lines.length * this.setting.line_height + (this.setting.padding * 2)
    }
    
    // ★ フォントとスタイルを再設定（canvas 再生成後の初期化必須）
    this.ctx.font      = this.get_font()
    this.ctx.fillStyle = this.setting.text_color
  }


  /**
   * Text
   */
  get_wrapper_lines() {
    const max_width    = this.canvas.width  - (this.setting.padding * 2)
    const text_datas   = this.parse_tagged_text(this.options.text)
    const lines        = []
    const y_margin     = this.setting.padding - (this.setting.line_height - this.setting.font_size) / 2
    let line_count     = 0
    let line_sub_count = 0
    for(let line_num=0; line_num<text_datas.length; line_num++){
      const text_data = text_datas[line_num]
      line_count++
      line_sub_count = 0
      for(const paragraph of text_data.parts){
        let words = paragraph.text.split('')
        let line = ``
        
        let width = 0
        for(const word of words){
          lines[line_count] = lines[line_count] || {}
          const testLine = (lines[line_count].text || "") + word
          width = this.ctx.measureText(testLine).width
          if(width > max_width && line !== ''){
            line_count++
            // line_sub_count++
            line = word
          } 
          else {
            line = testLine
          }

          const count = line_count
          // const count = line_count + line_sub_count
          lines[count] = lines[count] || {}
          lines[count] = {
            text : line,
            x    : this.setting.padding,
            y    : this.setting.line_height * line_count + y_margin,
            tag  : paragraph.tag,
            line_sub_count : line_sub_count,
          }
        }
        // line_count++
        line_sub_count++
      }
    }
    return lines
  }


  // テキストをタグ処理する仕様を追加
  parse_tagged_text(text) {
    const regex    = /<(\w+)(.*?)>|<\/(\w+)>|([^<>]+)/g
    const result   = []
    const tagStack = []
    const lines = text.split(/\r?\n/)

    for (const line of lines) {
      const parts = []
      let match
      regex.lastIndex = 0 // 正規表現のインデックスをリセット

      while ((match = regex.exec(line)) !== null) {
        if (match[1]) {
          // 開始タグ
          tagStack.push(match[1])
        } else if (match[3]) {
          // 終了タグ
          const idx = tagStack.lastIndexOf(match[3])
          if (idx !== -1) {
            tagStack.splice(idx, 1)
          }
        } else if (match[4]) {
          // テキスト部分
          parts.push({
            text: match[4],
            tag: tagStack.length > 0 ? tagStack[tagStack.length - 1] : null
          });
        }
      }

      const plainText = parts.map(p => p.text).join('')
      result.push({
        parts,
        plainText
      })
    }
    return result
  }


  // 最大値ないのline情報を取得（最大値オーバーを除外）
  get_range_lines(lines){
    const maxHeight  = this.canvas.height - (this.setting.padding * 2)
    const maxLines   = Math.floor(maxHeight / this.setting.line_height)
    const datas = []
    for(let i=0; i<lines.length; i++){
      if(!lines[i]){continue}
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

  // canvas内に文字描画する処理
  draw_lines(lines) {
    console.log(lines)
    for(const line of lines){
      if(!line){continue}
      switch(line.tag){
        case "blur":
          this.ctx.filter = "blur(5px)"
          break

        default:
          this.ctx.filter = "none"
          break
      }
      this.ctx.fillText(line.text, line.x, line.y)
    }
  }

  // 文字ぼかし処理
  set_tag(){

  }
}