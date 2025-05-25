import { Canvas } from "../src/canvas.js"

class Demo{
  constructor(){
    new Canvas({
      selector   : `.demo`,
      text_path  : `kintaro.txt`,
      text_color : `blue`,
      padding    : 20,
      height     : 200,
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
