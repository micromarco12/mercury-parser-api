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
  let content = document.querySelector('article') || document.querySelector('main') || document.body;

  // Clean the content to remove unwanted sections like navigation, ads, and other elements
  content = cleanArticleContent(content.innerHTML);

  // Extract author, if available
  const authorMeta = document.querySelector('meta[name="author"]');
  const author = authorMeta ? authorMeta.getAttribute('content') : '';

  // Extract publish date
  const dateMeta = document.querySelector('meta[property="article:published_time"], meta[name="pubdate"]');
  const date_published = dateMeta ? dateMeta.getAttribute('content') : '';

  // Extract lead image URL
  const leadImageMeta = document.querySelector('meta[property="og:image"]');
  const lead_image_url = leadImageMeta ? leadImageMeta.getAttribute('content') : '';

  // Collect all fields that might be included in the response
  const result = {
    title,
    content: cleanContent,
    author,
    date_published,
    lead_image_url: lead_image_url || undefined, // Set to undefined if empty
    dek: '', // Set to an empty string if not available
    url,
    domain: '',
    excerpt: '',
    word_count: content ? content.split(' ').length : 0,
    direction: 'ltr',
    total_pages: 1,
    rendered_pages: 1
  };

  // Remove any fields that are empty or undefined
  Object.keys(result).forEach(key => {
    if (result[key] === '' || result[key] === undefined || result[key] === null) {
      delete result[key];
    }
  });

  return result;
}

// Function to clean the extracted HTML
function cleanArticleContent(content) {
  const doc = new JSDOM(content);
  const body = doc.window.document.body;

  // Remove unwanted elements like navigation, footer, header, scripts, and ads
  const unwantedSelectors = [
    'header', 'footer', 'nav', 'aside', 'script', 'advertisement', '.sidebar', '.social-links', '.related-articles', '.comments'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = body.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Optionally, remove inline styling or unnecessary spans (like ad-blocking messages, etc.)
  const spans = body.querySelectorAll('span');
  spans.forEach(span => span.remove());

  return body.innerHTML.trim(); // Return the cleaned HTML
}

module.exports = extractContent;
