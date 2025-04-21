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

  // Extract title
  const title = document.querySelector('title')?.textContent || 'No title available';

  // Try extracting the main content by looking for <article>, <main>, or <body>
  const content = document.querySelector('article') || document.querySelector('main') || document.body;

  // Clean the content to remove unwanted sections like navigation, ads, and other elements
  const cleanContent = cleanArticleContent(content.innerHTML);

  // Extract author, if available
  const authorMeta = document.querySelector('meta[name="author"]');
  const author = authorMeta ? authorMeta.getAttribute('content') : '';

  // Extract publish date
  const dateMeta = document.querySelector('meta[property="article:published_time"], meta[name="pubdate"]');
  const date_published = dateMeta ? dateMeta.getAttribute('content') : '';

  // Extract lead image URL
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

// Function to clean the extracted HTML
function cleanArticleContent(content) {
  const doc = new JSDOM(content);
  const body = doc.window.document.body;

  // Remove unwanted elements like navigation, footer, header, scripts, ads, etc.
  const unwantedSelectors = [
    'header', 'footer', 'nav', 'aside', 'script', 'advertisement', '.sidebar', '.social-links', '.related-articles', '.comments',
    'img', 'video', 'iframe', 'svg', 'picture' // Remove media and non-content elements
  ];

  unwantedSelectors.forEach(selector => {
    const elements = body.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Remove any anchor tags (links)
  body.querySelectorAll('a').forEach(anchor => {
    anchor.remove();
  });

  // Remove unnecessary inline styles, spans, and divs
  body.querySelectorAll('span').forEach(span => span.remove());
  body.querySelectorAll('div').forEach(div => {
    if (!div.textContent.trim()) { // Remove empty divs
      div.remove();
    }
  });

  // Remove images but leave the alt text (if needed, otherwise remove the entire tag)
  body.querySelectorAll('img').forEach(img => img.remove());

  // Optionally remove all bold (strong) tags, or replace them with text
  body.querySelectorAll('strong').forEach(strong => strong.replaceWith(strong.textContent));

  // Remove empty paragraphs or content blocks
  body.querySelectorAll('p').forEach(p => {
    if (!p.textContent.trim()) {
      p.remove();
    }
  });

  // Clean up any unnecessary non-text elements like ad-related content
  body.innerHTML = body.innerHTML.replace(/https?:\/\/[^\s]+\.jpg|\.png|\.jpeg|\.gif/g, ''); // Remove image URLs

  // Return the cleaned HTML as text
  return body.textContent.trim(); // Extract the clean text content
}

module.exports = extractContent;
