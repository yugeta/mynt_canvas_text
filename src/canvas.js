// import { Zlib } from "./rawinflate.min.js"
// import "./rawinflate.min.js";

// const { RawInflate } = globalThis.Zlib;


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
    this.init(options)
  }

  async init(options){
    this.options = Object.assign(this.setting, options)
    this.options.text = await this.text_decode(this.options.text, this.options.encode_type)
    if(options.debug){
      console.log(this.options.text)
    }
    // 文字表示幅のセット（指定がない場合は文字サイズの1.5倍）
    this.options.line_height = this.options.line_height || this.options.font_size * 1.5
    this.canvas = this.set_canvas(this.options.selector)
    this.set_canvas_size()
    this.view()
    this.set_event()
  }

  // 文字列のでコード（平文の場合はそのまま）
  async text_decode(data , encode_type){
    if(!data){return ""}
    switch(encode_type){
      case "base64":
        return decodeURIComponent(escape(atob(data)))
        // return btoa(new TextDecoder("utf-8").decode(new TextEncoder().encode(data)))

      case "zlib":
        await this.load_zlib()
        const val = atob(data)
        const chars = ((val)=>{
          const arr = []
          for(let i=0; i<val.length; i++){
            arr.push(val[i].charCodeAt(0))
          }
          return new Uint8Array(arr)
        })(val)
        const inflate = new Zlib.RawInflate(chars).decompress()
        const decoded = new TextDecoder().decode(inflate);
        const sanitized = decoded.replace(/\+/g, ' ');
        return decodeURIComponent(sanitized);

      default:
        return data
    }
  }

  async load_zlib(){
    if(document.getElementById("zlib")){return}
    const script = document.createElement("script")
    script.src = import.meta.url.split("/").slice(0,-1).join("/") + `/rawinflate.min.js`
    script.id = "zlib"
    // スクリプトのロード完了を待つ
    await new Promise((resolve, reject) => {
      script.onload = () => resolve()
      script.onerror = (e) => reject(e)
      document.head.appendChild(script)
    });
  }

  // 表示処理（再描画でも利用する）
  view(){
    const long_datas = this.get_wrapper_lines()
    const long_lines = long_datas.lines
    const short_lines = this.get_range_lines(long_lines)
    const lines = this.setting.height === "auto" ? long_lines : short_lines
    this.reset_canvas(long_datas.line_count)
    this.clear_canvas()
    this.draw_lines(lines)
    // console.log("long_datas",long_datas)
    // console.log("short_lines",short_lines)
    // console.log("lines",lines)
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
  get_font(options){
    options = options || {}
    let fonts = []
    if(this.setting.font_style || options.font_style){
      fonts.push(options.font_style || this.setting.font_style)
    }
    if(this.setting.font_variant || options.font_variant){
      fonts.push(options.font_variant || this.setting.font_variant)
    }
    if(this.setting.font_weight || options.font_weight){
      fonts.push(options.font_weight || this.setting.font_weight)
    }
    fonts.push(`${(options.font_size || this.setting.font_size)}px`)
    fonts.push(options.font_family || this.setting.font_family)
    return fonts.join(" ")
  }

  // canvasの再描画に必要なheightリサイズや、フォント設定処理
  reset_canvas(line_count){
    // ★ 必要な高さを計算して canvas を再設定（ここで高さ確定）
    if(this.setting.height === "auto"){
      this.canvas.height = line_count * this.setting.line_height + (this.setting.padding * 2)
    }
    else if(this.canvas.height < this.canvas.offsetHeight){
      this.canvas.height = line_count * this.setting.line_height + (this.setting.padding * 2)
    }
    
    // ★ フォントとスタイルを再設定（canvas 再生成後の初期化必須）
    this.ctx.font      = this.get_font()
    this.ctx.fillStyle = this.setting.text_color
  }


  /**
   * Text
   */
  get_wrapper_lines() {
    const max_width    = this.canvas.width  - this.setting.padding
    const lines        = []
    const y_margin     = this.setting.padding + (this.setting.line_height - this.setting.font_size / 2)
    let line_number    = 0
    const text_datas   = this.parse_tagged_text(this.options.text)
    for(const text_data of text_datas){
      let x = this.setting.padding
      let sub_line_count = 0
      for(let j=0; j<text_data.parts.length; j++){
        const paragraph = text_data.parts[j]
        let words = paragraph.text.split('')
        const word_breaks = this.get_line_words(words, max_width, x)
        let width = 0
        for(let i=0; i<word_breaks.length; i++){
          if(i >= 1){
            x = this.setting.padding
          }
          lines.push({
            // line_text : paragraph.text,
            text  : word_breaks[i].text,
            x     : x,
            y     : this.setting.line_height * (line_number + i + sub_line_count) + y_margin,
            tag   : paragraph.tag,

            // width : word_breaks[i].width,
            // line_count  : word_breaks.length,
            // line_number : line_number,
            // y_margin : y_margin,
            // padding : this.setting.padding,
            // font_size : this.setting.font_size,
            // line_height : this.setting.line_height,
          })
          width = word_breaks[i].width
        }
        sub_line_count += word_breaks.length - 1
        x += width
      }

      line_number += sub_line_count + 1
    }
    return {
      lines : lines,
      line_count : line_number,
    }
  }

  // make line word
  get_line_words(words, max_width, x){
    const datas = []
    let line_count = 0
    let line = ``
    let width = 0
    let line_add = 0
    for(const word of words){
      const testLine = (datas[line_count] ? datas[line_count].text : "") + word
      width = this.ctx.measureText(testLine).width
      if(width + x > max_width && line !== ''){
        line_count++
        line = word
        x = this.setting.padding
      } 
      else {
        line = testLine
      }
      datas[line_count] = {
        text     : line,
        width    : this.ctx.measureText(line).width,
        // x_end    : width + x,
        // line_add : line_count,
        // width    : width,
        // word : word,
        // testLine : testLine,
        // width_x : width + x,
        // max_width : max_width,
      }
    }
    return datas
  }


  // テキストをタグ処理する仕様を追加
  parse_tagged_text(text) {
    const regex    = /<(\w+)(.*?)>|<\/(\w+)>|([^<>]+)/g
    const result   = []
    const tagStack = []
    // const lines = text.split(/\r?\n/)
    const lines = this.get_break_line(text)

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
            text : match[4],
            tag  : tagStack.length > 0 ? tagStack[tagStack.length - 1] : null,
            attr : match[2],
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

  // 改行コードと<br>タグで改行した行別配列を返す
  get_break_line(text){
    // return text.split(/\r?\n/)
    return text.split(/\r?\n|<br\s*\/?>/gi)
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
    for(const line of lines){
      if(!line){continue}
      switch(line.tag){
        case "blur":
          this.ctx.filter = "blur(5px)"
          this.ctx.fillText(line.text, line.x, line.y)
          break
        
        case "b":
          this.ctx.font = this.get_font({font_weight: "bold"})
          this.ctx.fillText(line.text, line.x, line.y)
          this.ctx.font = this.get_font()
          break

        case "i":
          this.ctx.font = this.get_font({font_style: "italic"})
          this.ctx.fillText(line.text, line.x, line.y)
          this.ctx.font = this.get_font()
          break

        default:
          this.ctx.filter = "none"
          this.ctx.fillText(line.text, line.x, line.y)
          break
      }
    }
  }

}