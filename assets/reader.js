/**
 * 凤栖梁 - 阅读器
 * 仅渲染 ## 正文 与 ## 章节备注 之间的内容
 */

const chapters = [
  '第01章-宫宴重逢.md', '第02章-咫尺天涯.md', '第03章-姐姐之殇.md', '第04章-边关书信.md',
  '第05章-小公主.md', '第06章-德妃登场.md', '第07章-挑拨离间.md', '第08章-流产之痛.md',
  '第09章-旧情泄露.md', '第10章-设局下药.md', '第11章-意外之夜.md', '第12章-嫣儿解围.md',
  '第13章-迷雾重重.md', '第14章-有孕在身.md', '第15章-混淆视听.md', '第16章-龙凤呈祥.md',
  '第17章-姐姐之死.md', '第18章-送子离宫.md', '第19章-父子相伴.md', '第20章-嫣儿之妒.md'
];

function getChapterFromUrl() {
  const params = new URLSearchParams(location.search);
  return params.get('ch') || chapters[0];
}

function extractBody(mdText) {
  // 提取 ## 正文 与 ## 章节备注 之间的内容（不含这两行）
  const startMarker = '## 正文';
  const endMarker = '## 章节备注';

  const startIdx = mdText.indexOf(startMarker);
  const endIdx = mdText.indexOf(endMarker);

  if (startIdx === -1) {
    return mdText; // 没有标记则返回全文
  }

  const bodyStart = startIdx + startMarker.length;
  const bodyEnd = endIdx !== -1 ? endIdx : mdText.length;

  return mdText.slice(bodyStart, bodyEnd).trim();
}

function extractChapterTitle(mdText) {
  const match = mdText.match(/^#\s*([^\n]+)/);
  return match ? match[1].trim() : '未知章节';
}

function renderMarkdown(md) {
  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true });
    return marked.parse(md);
  }
  return md.replace(/\n/g, '<br>');
}

async function loadChapter(filename) {
  const res = await fetch(filename);
  if (!res.ok) throw new Error('加载失败');
  return res.text();
}

function initNav(currentFile) {
  const idx = chapters.indexOf(currentFile);
  const prev = document.getElementById('prev-link');
  const next = document.getElementById('next-link');

  if (idx > 0) {
    prev.href = `reader.html?ch=${encodeURIComponent(chapters[idx - 1])}`;
    prev.style.pointerEvents = 'auto';
    prev.style.color = '';
  } else {
    prev.href = '#';
    prev.style.pointerEvents = 'none';
    prev.style.color = 'var(--text-muted)';
  }

  if (idx >= 0 && idx < chapters.length - 1) {
    next.href = `reader.html?ch=${encodeURIComponent(chapters[idx + 1])}`;
    next.style.pointerEvents = 'auto';
    next.style.color = '';
  } else {
    next.href = '#';
    next.style.pointerEvents = 'none';
    next.style.color = 'var(--text-muted)';
  }
}

async function main() {
  const container = document.getElementById('content');
  const titleEl = document.getElementById('chapter-title');
  const currentFile = getChapterFromUrl();

  try {
    const raw = await loadChapter(currentFile);
    const title = extractChapterTitle(raw);
    const body = extractBody(raw);
    const html = renderMarkdown(body);

    titleEl.textContent = title;
    container.innerHTML = `<div class="content-body">${html}</div>`;
    initNav(currentFile);
  } catch (err) {
    container.innerHTML = '<p class="loading">章节加载失败，请检查网络或稍后重试。</p>';
    titleEl.textContent = '加载失败';
  }
}

main();
