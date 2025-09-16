# Hexo Filter Copywriting

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)
[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E6%96%87%E6%A1%A3-blue.svg?style=for-the-badge)](../README.md)

A powerful Hexo filter that automatically refines your post content according to established Chinese copywriting guidelines. It intelligently adds spacing, standardizes punctuation, and corrects proper nouns to enhance readability and professionalism, all while safely ignoring code blocks.

## Features

-   Powered by `pangu.js` to automatically add spacing between CJK (Chinese, Japanese, Korean) and Latin characters/numbers.
-   Intelligently converts half-width punctuation to full-width in Chinese contexts and replaces standard quotes like `“...”` with the more elegant `「...」`.
-   Automatically corrects the capitalization of common technical terms (e.g., `github` -> `GitHub`) using a customizable dictionary.
-   Safely ignores all content within `<pre>` and `<code>` tags, ensuring your code snippets are never modified.
-   Automatically skips posts explicitly marked with a non-CJK language (e.g., `lang: en`).
-   Each rule set (spacing, punctuation, proper nouns) can be individually enabled or disabled in your `_config.yml`.

## Installation

Install using npm in your Hexo project's root directory.

```bash
npm install hexo-filter-copywriting --save
hexo clean
```

## Usage

The plugin runs automatically after installation. You can customize its behavior in your Hexo site's root `_config.yml` file.

### 1. Configuration
    
Add the following configuration block to your root `_config.yml` file to control the filter's behavior. If this block is not present, all features will be enabled by default for CJK-language posts.

```yaml
copywriting:
  enable: true        # Master switch to enable/disable all formatting.
  pangu: true         # For CJK/Latin spacing.
  punctuation: true   # For punctuation conversion (e.g., “...” -> 「...」).
  proper_nouns: true  # For proper noun capitalization (e.g., github -> GitHub).
```

### 2. Create a Noun Dictionary
    
To use the "Proper Noun Correction" feature, create a file named `dictionary.json` in the root directory of your Hexo project.

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

If this file is not found, this feature will be gracefully skipped.

## Philosophy & Acknowledgements

This plugin was built to automate the excellent typesetting rules set forth by the community for enhanced Chinese-language readability. It is a practical implementation of the principles found in these two essential guides:

- [sparanoid/chinese-copywriting-guidelines](https://github.com/sparanoid/chinese-copywriting-guidelines)
- [ruanyf/document-style-guide](https://github.com/ruanyf/document-style-guide)

The goal is to handle the tedious aspects of typography automatically, allowing writers to focus purely on content. Contributions and suggestions for new rules are welcome.

## License

Released under the [MIT License](./LICENSE).