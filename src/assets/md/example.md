# MDTU 简介

Markdown Devtool，简称 `MDTU`，中文名 `码途编辑器`。是一款基于 [bytemd](https://github.com/bytedance/bytemd) 由山月开发的支持微信样式的 Markdown 编辑器。

## 列表

**有序列表**

1. 天干
    1. 甲
    1. 乙
    1. 丙
    1. 丁
1. 地支
    1. 子
    1. 丑
    1. 寅
    1. 卯

**无序列表**

+ 天干
    + 甲
    + 乙
    + 丙
    + 丁
+ 地支
    + 子
    + 丑
    + 寅
    + 卯

## 引用

> 欲穷千里目，更上一层楼

>> 举头望明月，低头思故乡

>>> 今春看又过，何日是归年

## 代码

**内联代码**

`import`

**代码段**

``` js
// 如何实现一个防抖函数
function debounce (f, wait) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => f(...args), wait)
  }
}
```

## 标题

以下是关于标题的样式

# 一级标题

## 二级标题

### 三级标题


## 主题

多主题被我开源在了 Github 仓库: [markdown-theme](https://github.com/shfshanyue/markdown-theme)。

| Theme | 中文 | Author | Preview |
| --- | --- | --- | --- |
| github | \- | [sindresorhus/github-markdown-css](https://github.com/sindresorhus/github-markdown-css) | [Preview](https://markdown-theme.vercel.app/#github) |
| shanchui | 山吹 | [#66CCFF](https://github.com/elyhg) | [Preview](https://markdown-theme.vercel.app/#shanchui) |
| shanyue | 山月 | [shanyue](https://github.com/shfshanyue) | [Preview](https://npm.devtool.tech/lodash) |
| condensed-night-purple | 凝夜紫 | [童欧巴](https://github.com/Geekhyt) | [Preview](https://markdown-theme.vercel.app/#condensed-night-purple) |

## 外链

这里是[山月的博客](https://shanyue.tech)，这里是山月进行了多年面试总结的[前端面试题](https://q.shanyue.tech)。

您可以点击编辑器右上角进行**微信外链转脚注**与**微信外链转二维码**，并点击右上角微信图标进行复制。

这里是[山月的博客 (不显示二维码)](shanyue.tech)，这里是山月进行了多年面试总结的[前端面试题 (不显示二维码)](q.shanyue.tech)。

如果链接地址不是以 `http` 开头，则不会显示它的二维码。

## URL to Markdown

您可以点击 MDTU 编辑器右上角**链接采集按钮**，输入 URL 回车确认可从 URL 中获取 Markdown。

![链接采集](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/23487fbd375e42c8b1ac6410c89fb656~tplv-k3u1fbpfcp-watermark.image)

## 自动编号、插入目录、插入导图

您可以点击 MDTU 编辑器左上角**自动编号**，将会对一级标题、二级标题、三级标题进行自动编号。

## 使用模板

您可以点击 MDTU 编辑器 `使用模板 -> 管理模板` 按钮，配置自己的模板。

使用占位符 `{{ content }}` 代表正文内容。

## 方格背景

您可以点击 MDTU 编辑器 `UI -> 方格背景`，将会对该主题添加上方格背景。

## 赞赏

如果该工具对你有所帮助，可以请我喝一瓶~~农夫山泉~~冰露 (别人说农夫山泉太奢侈，这里改成冰露吧)

![请我喝一瓶冰露](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/263bac43ead842bab0efbf6a431f4e32~tplv-k3u1fbpfcp-watermark.image)

## 交流

欢迎扫码添加我的微信，加入 MDTU 编辑器交流群

![shanyue94](https://shanyue.tech/wechat.jpeg)
