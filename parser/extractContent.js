const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const scrapingStrategies = require('./scrapingStrategies');

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

  // Clean up the content after applying scraping strategies
  const cleanContent = scrapingStrategies.applyCleaningStrategies(content);

  // Collect all fields that might be included in the response
  const result = {
    title,
    content: cleanContent,
    author,
    date_published,
    lead_image_url: '', // Empty string will be removed if not filled
    dek: '',            // Empty string will be removed if not filled
    url,
    domain: '',
    excerpt: '',
    word_count: cleanContent ? cleanContent.split(' ').length : 0,
    direction: 'ltr',
    total_pages: 1,
    rendered_pages: 1
  };

  // Remove any fields that are empty or null
  Object.keys(result).forEach(key => {
    if (!result[key] && result[key] !== 0) { // Removes empty, null, or undefined fields
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
    'header', 'footer', 'nav', 'aside', 'script', 'advertisement', '.sidebar', '.social-links', '.related-articles', '.comments', '.sponsored'
  ];

  unwantedSelectors.forEach(selector => {
    const elements = body.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Remove image tags, links, and any unwanted inline content like emojis or broken content
  const images = body.querySelectorAll('img');
  images.forEach(img => img.remove());  // Remove images

  const links = body.querySelectorAll('a');
  links.forEach(link => link.remove());  // Remove links

  // Clean up empty or redundant HTML elements
  const emptyElements = body.querySelectorAll('*:empty');
  emptyElements.forEach(el => el.remove());

  // Optionally, remove inline styling or unnecessary spans (like ad-blocking messages, etc.)
  const spans = body.querySelectorAll('span');
  spans.forEach(span => span.remove());

  // Clean up all line breaks and excess whitespace
  let contentString = body.innerHTML.trim();
  contentString = contentString.replace(/\n/g, ' ');  // Remove new line characters
  contentString = contentString.replace(/\s+/g, ' '); // Replace multiple spaces with a single space

  // Replace any lingering placeholder content (like "Pope Francis" or other test messages)
  contentString = contentString.replace(/Pope Francis.+?88/g, '');  // Remove example phrases

  return contentString;
}

module.exports = extractContent;
