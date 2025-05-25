Canvas Text Blur
===
```
Create : 2025-05-24
Author : Yugeta.Koji
```

# Summary
- Webサイトで、文字列をぼかす時に、HTMLに書かれた文字列を参照されたく無い場合にCanvasで表示する、セキュア処理するためのツール
- テキストをcanvas.jsでパラメータを付けてインスタンス起動すると、指定のcanvas（または自動的にcanvasが作られて）にテキスト文字が表示される。
- テキスト文字はcanvasサイズで折り返し、wrapされる。
- canvasの縦サイズが固定の場合に、文字がはみ出す場合は、"..."（３点リーダー）で、はみ出し部分は非表示になる。
- canvasの縦サイズが可変(auto)の場合は、文字表示サイズに合わせて、canvasがリサイズされる。
- リアルタイムなcanvasのサイズ変更に対して、文字の折り返しが再描画される。


# Howto



# Demo
> https://yugeta.github.io/mynt_canvas_text/demo/


# selector
- 既存のcanvasまたは、親要素を指定する事ができます。(canvasタグを自動判別)


# Font
- 読み込みフォントは、CSSの記述と併用して使えます。


# Cauyion
- テキスト内にHTMLタグは使用できません。
