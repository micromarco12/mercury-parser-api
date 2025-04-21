const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Import scraping strategies to refine the scraping method
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

  // Extract lead image URL
  const leadImageMeta = document.querySelector('meta[property="og:image"]');
  const lead_image_url = leadImageMeta ? leadImageMeta.getAttribute('content') : '';

  // You can use scraping strategies here to determine if extra cleaning or modifications are needed
  const cleanContent = scrapingStrategies.applyCleaningStrategies(content);

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

  // Remove unwanted elements like navigation, footer, header, scripts, and ads
  const unwantedSelectors = [
    'header', 'footer', 'nav', 'aside', 'script', 'advertisement', '.sidebar', '.social-links', '.related-articles', '.comments'
  ];

  unwantedSelectors.forEach(selector => {
    const elements = body.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Remove image tags and links
  const images = body.querySelectorAll('img');
  images.forEach(img => img.remove());  // Remove images

  const links = body.querySelectorAll('a');
  links.forEach(link => link.remove());  // Remove links

  // Optionally, remove inline styling or unnecessary spans (like ad-blocking messages, etc.)
  const spans = body.querySelectorAll('span');
  spans.forEach(span => span.remove());

  // Clean up all line breaks and excess whitespace
  let contentString = body.innerHTML.trim();
  contentString = contentString.replace(/\n/g, ' ');  // Remove new line characters
  contentString = contentString.replace(/\s+/g, ' '); // Replace multiple spaces with a single space

  return contentString;
}

module.exports = extractContent;
