import { Canvas }   from "../../src/canvas.js"

class Demo{
  constructor(){
    this.encode_type = "zlib"
    this.load()
  }

  async load(){
    const formData = new FormData()
    formData.append("text_path", "../demo/kintaro_blur.txt")
    formData.append("encode_type", this.encode_type)

    const res = await fetch("../../src/load_text.php", {
      method : "POST",
      body   : formData,
    })
    .then((res)=>{return res.text()})

    // console.log(res)
    // console.log(this.encode_type)
    this.canvas(res)
  }

  canvas(text){
    new Canvas({
      text        : text,
      selector    : `.demo`,
      text_color  : `red`,
      padding     : 20,
      font_size   : 16,
      height      : "auto",
      font_family : `"Noto Sans JP", sans-serif`,
      font_weight : "",
      font_style  : "",
      encode_type : this.encode_type,
    })
  }
}

switch(document.readyState){
  case "complete":
  case "interactive":
    new Demo();break
  default:
    window.addEventListener("DOMContentLoaded", (()=>new Demo()))
}
