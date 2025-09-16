'use strict';

const cheerio = require('cheerio');
const pangu = require('pangu');
const fs = require('fs');
const path = require('path');

hexo.log.info('[hexo-filter-copywriting] hexo-filter-copywriting loaded successfully');

// 加载专有名词词典并处理错误
let properNounsDict = {};
try {
  const dictionaryPath = path.join(hexo.base_dir, 'dictionary.json');
  const dictionaryData = fs.readFileSync(dictionaryPath, 'utf8');
  properNounsDict = JSON.parse(dictionaryData);
  hexo.log.info(`[hexo-filter-copywriting] Loaded ${Object.keys(properNounsDict).length} proper nouns from dictionary`);
} catch (error) {
  hexo.log.warn('[hexo-filter-copywriting] Dictionary file not found or invalid, skipping proper noun correction:', error.message);
}

/**
 * 文章渲染后过滤器，用于安全地格式化文本内容
 * 优先级设置为 15，确保在 Markdown 渲染后运行
 */
hexo.extend.filter.register('after_post_render', function(data) {
  const config = this.config.copywriting || {};
  if (config.enable === false) {
    hexo.log.debug(`[hexo-filter-copywriting] Formatting disabled by master switch for: ${data.title || 'Untitled'}`);
    return data;
  }

  const panguEnabled = config.pangu !== false;
  const punctuationEnabled = config.punctuation !== false;
  const nounsEnabled = config.proper_nouns !== false;

  // 只处理文章（跳过页面等其他类型）
  if (data.layout !== 'post') {
    return data;
  }

  // 如果文章指定了语言但不是中日韩语系，则跳过格式化
  const cjkLangs = ['zh', 'ja', 'ko'];
  if (data.lang && !cjkLangs.some(lang => data.lang.toLowerCase().startsWith(lang))) {
    hexo.log.debug(`[hexo-filter-copywriting] Skipping non-CJK post (${data.lang}): ${data.title || 'Untitled'}`);
    return data;
  }
  
  hexo.log.debug(`[hexo-filter-copywriting] Processing post: ${data.title || 'Untitled'}`);
  
  if (!data.content || typeof data.content !== 'string') {
    hexo.log.debug('[hexo-filter-copywriting] No content to process, skipping');
    return data;
  }
  
  const $ = cheerio.load(data.content, {
    decodeEntities: false,
    lowerCaseAttributeNames: false
  });
  
  let safeTextNodesCount = 0;
  let protectedNodesCount = 0;
  
  function findAllTextNodes(element) {
    const textNodes = [];
    
    function traverse(node) {
      if (node.type === 'text') {
        textNodes.push(node);
      } else if (node.children) {
        node.children.forEach(traverse);
      }
    }
    
    traverse(element);
    return textNodes;
  }
  
  function isProtectedNode(textNode) {
    let current = textNode.parent;
    
    while (current) {
      if (current.type === 'tag') {
        const tagName = current.name.toLowerCase();
        if (tagName === 'pre' || tagName === 'code' || tagName === 'script' || tagName === 'style') {
          return true;
        }
      }
      current = current.parent;
    }
    
    return false;
  }
  
  const allTextNodes = findAllTextNodes($.root()[0]);
  
  hexo.log.debug(`[hexo-filter-copywriting] Found ${allTextNodes.length} total text nodes`);
  
  allTextNodes.forEach((textNode, index) => {
    const nodeText = textNode.data || '';
    
    if (!nodeText.trim()) {
      return;
    }
    
    if (isProtectedNode(textNode)) {
      protectedNodesCount++;
      hexo.log.debug(`[hexo-filter-copywriting] PROTECTED text node ${index + 1}: "${nodeText.substring(0, 50)}${nodeText.length > 50 ? '...' : ''}"`);
    } else {
      safeTextNodesCount++;
      
      let stage1Text = nodeText;

      // 1. 专有名词修正
      if (nounsEnabled) {
        if (Object.keys(properNounsDict).length > 0) {
          for (const [incorrect, correct] of Object.entries(properNounsDict)) {
            const regex = new RegExp(`\\b${incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            stage1Text = stage1Text.replace(regex, correct);
          }
        }
      }

      let stage2Text = stage1Text;
    
      // 2. 标点转换
      if (punctuationEnabled) {
        // 逗号
        stage2Text = stage2Text.replace(/([\u4e00-\u9fa5])\s*,\s*/gu, '$1，');
        stage2Text = stage2Text.replace(/\s*,\s*([\u4e00-\u9fa5])/gu, '，$1');
        
        // 问号
        stage2Text = stage2Text.replace(/([\u4e00-\u9fa5])\s*\?\s*/gu, '$1？');
        stage2Text = stage2Text.replace(/\s*\?\s*([\u4e00-\u9fa5])/gu, '？$1');
        
        // 感叹号
        stage2Text = stage2Text.replace(/([\u4e00-\u9fa5])\s*!\s*/gu, '$1！');
        stage2Text = stage2Text.replace(/\s*!\s*([\u4e00-\u9fa5])/gu, '！$1');
        
        // 冒号
        stage2Text = stage2Text.replace(/([\u4e00-\u9fa5])\s*:\s*/gu, '$1：');
        stage2Text = stage2Text.replace(/\s*:\s*([\u4e00-\u9fa5])/gu, '：$1');
        
        // 分号
        stage2Text = stage2Text.replace(/([\u4e00-\u9fa5])\s*;\s*/gu, '$1；');
        stage2Text = stage2Text.replace(/\s*;\s*([\u4e00-\u9fa5])/gu, '；$1');

        // 省略号
        stage2Text = stage2Text.replace(/\s*\.{3,}\s*/g, '……');

        // 句号
        stage2Text = stage2Text.replace(/([\u4e00-\u9fa5])\s*\.\s*/g, '$1。');
        
        // 引号转直角引号
        stage2Text = stage2Text.replace(/\s*(“|&ldquo;)\s*/g, '「');
        stage2Text = stage2Text.replace(/\s*(”|&rdquo;)\s*/g, '」');
        stage2Text = stage2Text.replace(/\s*(‘|&lsquo;)\s*/g, '『');
        stage2Text = stage2Text.replace(/\s*(’|&rsquo;)\s*/g, '』');

        // 括号
        stage2Text = stage2Text.replace(/\s*\(\s*/g, '（');
        stage2Text = stage2Text.replace(/\s*\)\s*/g, '）');
      }
      
      // 3. Pangu 空格处理
      let stage3Text = stage2Text;

      if (panguEnabled) {
        stage3Text = pangu.spacingText(stage2Text);
      }
      
      // 4. 清理不必要的空格
      let formattedText = stage3Text;

      formattedText = formattedText.replace(/\s+(」|』|）|，|。|？|！|：|；|……)/g, '$1');
      formattedText = formattedText.replace(/(「|『|（)\s+/g, '$1');
      formattedText = formattedText.replace(/\s{2,}/g, ' ');
      
      textNode.data = formattedText;
      
      if (nodeText !== formattedText) {
        hexo.log.debug(`[hexo-filter-copywriting] Formatted text node ${safeTextNodesCount}:`);
        hexo.log.debug(`[hexo-filter-copywriting]   Original: "${nodeText.substring(0, 50)}${nodeText.length > 50 ? '...' : ''}"`);
        hexo.log.debug(`[hexo-filter-copywriting]   Proper nouns: "${stage1Text.substring(0, 50)}${stage1Text.length > 50 ? '...' : ''}"`);
        hexo.log.debug(`[hexo-filter-copywriting]   Punctuation: "${stage2Text.substring(0, 50)}${stage2Text.length > 50 ? '...' : ''}"`);
        hexo.log.debug(`[hexo-filter-copywriting]   Pangu spacing: "${stage3Text.substring(0, 50)}${stage3Text.length > 50 ? '...' : ''}"`);
        hexo.log.debug(`[hexo-filter-copywriting]   Final: "${formattedText.substring(0, 50)}${formattedText.length > 50 ? '...' : ''}"`);
      }
    }
  });
  
  hexo.log.info(`[hexo-filter-copywriting] Text analysis complete for "${data.title || 'Untitled'}"`);
  hexo.log.info(`[hexo-filter-copywriting] - Safe text nodes: ${safeTextNodesCount}`);
  hexo.log.info(`[hexo-filter-copywriting] - Protected text nodes: ${protectedNodesCount}`);
  hexo.log.info(`[hexo-filter-copywriting] - Total text nodes: ${allTextNodes.length}`);
  
  // 行内代码左右（如果紧邻中文字符）添加空格
  if (panguEnabled) {
    let codeSpacingCount = 0;

    $('code:not(pre > code)').each(function() {
      const codeElement = this;
      
      const prevSibling = codeElement.prev;
      if (prevSibling && prevSibling.type === 'text') {
        const prevText = prevSibling.data || '';
        if (/[\u4e00-\u9fa5]$/.test(prevText)) {
          prevSibling.data = prevText + ' ';
          codeSpacingCount++;
          hexo.log.debug(`[hexo-filter-copywriting] Added space before <code>: "${prevText}" -> "${prevSibling.data}"`);
        }
      }
      
      const nextSibling = codeElement.next;
      if (nextSibling && nextSibling.type === 'text') {
        const nextText = nextSibling.data || '';
        if (/^[\u4e00-\u9fa5]/.test(nextText)) {
          nextSibling.data = ' ' + nextText;
          codeSpacingCount++;
          hexo.log.debug(`[hexo-filter-copywriting] Added space after <code>: "${nextText}" -> "${nextSibling.data}"`);
        }
      }
    });
    
    if (codeSpacingCount > 0) {
      hexo.log.info(`[hexo-filter-copywriting] Applied ${codeSpacingCount} code tag spacing corrections`);
    }
  }
  
  data.content = $.html();
  
  return data;
  
}, 15);

hexo.log.info('[hexo-filter-copywriting] Filter registered with priority 15');
