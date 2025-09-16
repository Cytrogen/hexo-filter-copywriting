# Hexo Filter Copywriting 中文文案排版过滤器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

一个强大的 Hexo 过滤器，它能根据成熟的中文文案排版规范，自动优化你的文章内容。它能智能地添加空格、统一标点符号、修正专有名词，从而提升文章的可读性与专业性，同时能安全地忽略所有代码块。

## 功能特性

- 基于 `pangu.js`，自动在中日韩（CJK）字符与拉丁字母/数字之间添加空格
- 在中文语境下，智能地将半角标点转换为全角，并将 `“”` 等引号替换为更美观的 `「」`
- 使用可自定义的词典，自动修正常见技术名词的大小写（例如 `github` -> `GitHub`）
- 忽略所有 `<pre>` 和 `<code>` 标签内的内容，确保代码片段不会被错误修改
- 自动跳过被明确标记为非 CJK（中日韩）语言（如 `lang: en`）的文章
- 你可以在 `_config.yml` 中独立开启或关闭每一套规则（空格、标点、专有名词）

## 安装

在你的 Hexo 项目根目录下，使用 npm 进行安装。

```bash
npm install hexo-filter-copywriting --save
hexo clean
```

## 使用方法

该插件在安装后会自动运行。你可以在你博客站点的根 `_config.yml` 文件中对它进行自定义配置。

1. 配置
   
   将以下配置块添加到你的根 `_config.yml` 文件中，以控制过滤器的行为。如果不存在这个配置块，所有功能将默认对 CJK 语言文章开启。

   ```yaml
   copywriting:
     enable: true        # 用于开启或关闭所有格式化功能的总开关
     pangu: true         # 中英文空格
     punctuation: true   # 标点符号转换 (例如 “” -> 「」)
     proper_nouns: true  # 专有名词大小写修正 (例如 github -> GitHub)
   ```

2. 创建名词词典
   
   要使用“专有名词修正”功能，请在你的 Hexo 项目根目录下创建一个名为 `dictionary.json` 的文件。

   ```json
   {
     "github": "GitHub",
     "react": "React",
     "javascript": "JavaScript",
     "js": "JS",
     "css": "CSS",
     "html": "HTML",
     "ajax": "AJAX",
     "npm": "npm"
   }
   ```

   如果未找到此文件，该功能则会被跳过。

## 开发理念与致谢

本插件的目的是将社区中广为流传的、优秀的中文文案排版规范自动化，以提升文章的可读性。它是对以下两份重要指南中核心原则的具体代码实现：

- [sparanoid/chinese-copywriting-guidelines（中文文案排版指北）](https://github.com/sparanoid/chinese-copywriting-guidelines)
- [ruanyf/document-style-guide（中文技术文档的写作规范）](https://github.com/ruanyf/document-style-guide)

我们的目标是让这些繁琐的排版细节能够被自动处理，从而让写作者可以更专注于内容本身。欢迎提出贡献和新的规则建议。

## 许可证

基于 [MIT 许可证](./LICENSE) 发布。
