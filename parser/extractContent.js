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

  // Focus on extracting the main article body
  const content = document.querySelector('article') || document.querySelector('main') || document.body;

  // Clean the content to remove unnecessary sections like ads or navigation
  const cleanContent = cleanArticleContent(content.innerHTML);

  const title = document.querySelector('title')?.textContent || '';
  const authorMeta = document.querySelector('meta[name="author"]');
  const author = authorMeta ? authorMeta.getAttribute('content') : '';
  const dateMeta = document.querySelector('meta[property="article:published_time"], meta[name="pubdate"]');
  const date_published = dateMeta ? dateMeta.getAttribute('content') : '';
  const leadImageMeta = document.querySelector('meta[property="og:image"]');
  const lead_image_url = leadImageMeta ? leadImageMeta.getAttribute('content') : '';

  return {
    title,
    content: cleanContent,
    author,
    date_published,
    lead_image_url
  };
}

function cleanArticleContent(content) {
  // Remove unwanted elements like scripts, ads, etc.
  const doc = new JSDOM(content);
  const body = doc.window.document.body;

  // Remove elements like ads or navigation, if needed
  const scripts = body.querySelectorAll('script, footer, header, nav, aside, .advertisement');
  scripts.forEach(el => el.remove());

  // You can add more selectors if there are other unwanted elements to remove.

  return body.innerHTML; // Return cleaned HTML content
}

module.exports = extractContent;
