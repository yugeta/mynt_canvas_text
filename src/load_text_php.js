

export class LoadText{

  constructor(options){
    this.promise = new Promise((resolve, reject)=>{
      this.resolve = resolve
      this.reject  = reject
      this.load(options.text_path)
    })
  }

  async load(text_path){
    if(!text_path){return}
    const formData = new FormData()
    formData.append("text_path", text_path)
    const res = await fetch("../src/secure.php", {
      method: "POST",
      body: formData,
    })
    .then((res)=>{return res.text()})
    // const res = await fetch(text_path, {
    //   method: "GET"
    // })
    // .then((res)=>{return res.text()})
    this.finish(res)
  }

  finish(text){
    this.resolve(text)
  }
}