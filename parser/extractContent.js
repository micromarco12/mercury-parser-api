const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const customRules = require('./scrapingStrategies'); // Import site-specific scraping rules

async function extractContent(url) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;

  // Get the hostname from the URL to apply the site-specific rules
  const hostname = new URL(url).hostname;

  // Check if there are custom rules for this site
  const rules = customRules[hostname];

  let content;

  if (rules) {
    // Use site-specific selectors if available
    const articleContent = document.querySelector(rules.articleSelector);
    content = articleContent ? articleContent.querySelector(rules.contentSelector).innerHTML : '';
  } else {
    // Default content extraction if no specific rules are found
    content = document.querySelector('article') || document.querySelector('main') || document.body;
  }

  // Clean the extracted content to remove unwanted sections
  const cleanContent = cleanArticleContent(content.innerHTML);

  // Extract title
  const title = document.querySelector('title')?.textContent || 'No title available';

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
