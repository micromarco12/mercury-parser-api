function applyCleaningStrategies(content) {
  // Remove JavaScript
  content = content.replace(/<script[^>]*>(.*?)<\/script>/g, '');

  // Remove unwanted meta tags like 'author', 'robots', etc.
  content = content.replace(/<meta[^>]*>/g, '');

  // Remove unwanted external links (if any)
  content = content.replace(/<a href="https?:\/\/.*?">.*?<\/a>/g, '');

  // Remove inline styles if any
  content = content.replace(/style=".*?"/g, '');

  // Additional custom cleaning strategies can go here...

  return content;
}

module.exports = {
  applyCleaningStrategies
};
