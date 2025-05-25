import { Canvas } from "../src/canvas.js"

class Demo{
  constructor(){
    new Canvas({
      selector   : `.demo`,
      text_path  : `sample.txt`,
      text_color : `blue`,
      padding    : 20,
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
