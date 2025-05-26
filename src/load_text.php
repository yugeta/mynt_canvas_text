<?php


$data = new Main(@$_POST);
echo $data->text;

class Main{
  public $text = null;

  function __construct($options=[]){
    $text = $this->load_text($options["text_path"]);
    $this->text = $this->convert_text($text, $options["encode_type"]);
  }

  private function load_text($text_path=null){
    if(!is_file($text_path)){return;}
    return file_get_contents($text_path);
  }

  private function convert_text($text=null, $encode_type=null){
    if(!$text){return;}
    switch($encode_type){
      case "base64":
        return base64_encode($text);
        // return base64_encode(urlencode($text));

      default:
        return $text;
    }
  }
}