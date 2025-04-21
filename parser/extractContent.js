const jsdom = require('jsdom');
const { JSDOM } = jsdom;

async function extractContent(url) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;

  const title = document.querySelector('title')?.textContent || '';
  const content = document.body ? document.body.innerHTML : '';
  const authorMeta = document.querySelector('meta[name="author"]');
  const author = authorMeta ? authorMeta.getAttribute('content') : '';
  const dateMeta = document.querySelector('meta[property="article:published_time"], meta[name="pubdate"]');
  const date_published = dateMeta ? dateMeta.getAttribute('content') : '';
  const leadImageMeta = document.querySelector('meta[property="og:image"]');
  const lead_image_url = leadImageMeta ? leadImageMeta.getAttribute('content') : '';

  return {
    title,
    content,
    author,
    date_published,
    lead_image_url
  };
}

module.exports = extractContent;
