# kijs
Library DOM replace jQuery for >IE11
[View docs](https://tachibana-shin.github.io/kijs)

[![Build](https://github.com/tachibana-shin/kijs/actions/workflows/docs.yml/badge.svg)](https://github.com/tachibana-shin/kijs/actions/workflows/docs.yml)
[![NPM](https://badge.fury.io/js/kijs.svg)](http://badge.fury.io/js/kijs)

Example:
``` ts
import $ from "kijs"

$("body")
.append("<div id='count'>0")
.append("<button>Click me!")

let count = 0
$("button").click(() => {
  $("#count").text(++count)
})
```
