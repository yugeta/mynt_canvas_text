import { LoadText } from "../src/load_text.js"
import { Canvas }   from "../src/canvas.js"

class Demo{
  constructor(){
    const encode_type = "base64"

    new LoadText({
      text_path   : `kintaro_blur.txt`,
      encode_type : encode_type,

    })
    
    .promise.then((text)=>{
      new Canvas({
        text        : text,
        selector    : `.demo`,
        text_color  : `blue`,
        padding     : 20,
        font_size   : 16,
        height      : "auto",
        font_family : `"Noto Sans JP", sans-serif`,
        font_weight : "",
        font_style  : "",
        encode_type : encode_type,
      })
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
