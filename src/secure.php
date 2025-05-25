<?php

if($_POST["text_path"] && is_file($_POST["text_path"])){
  $text = file_get_contents($_POST["text_path"]);
  echo $text;
}