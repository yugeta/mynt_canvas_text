import { Canvas } from "../src/canvas.js"

class Demo{
  constructor(){
    new Canvas({
      selector    : `.demo`,
      text_path   : `kintaro.txt`,
      text_color  : `blue`,
      padding     : 20,
      font_size   : 16,
      height      : "auto",
      font_family : `"Noto Sans JP", sans-serif`,
      font_weight : "bold",
      font_style  : "italic",
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
