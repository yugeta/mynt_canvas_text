

export class LoadText{

  constructor(options){
    this.promise = new Promise((resolve, reject)=>{
      this.resolve = resolve
      this.reject  = reject
      this.load(options.text_path, options.encode_type)
    })
  }

  async load(text_path, encode_type){
    if(!text_path){
      this.finish("")
      return
    }
    const res = await fetch(text_path, {
      method: "GET"
    })
    .then((res)=>{return res.text()})
    const data = this.encode(res, encode_type)
    this.finish(data)
  }

  encode(text, encode_type){
    switch(encode_type){
      case "base64":
        return btoa(unescape(encodeURIComponent(text)))

      default:
        return text
    }
  }

  finish(text){
    this.resolve(text)
  }
}