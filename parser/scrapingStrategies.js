// scrapingStrategies.js

function applyCleaningStrategies(content) {
  // Add more custom cleaning strategies here if necessary
  content = content.replace(/<script[^>]*>(.*?)<\/script>/g, ''); // Remove JavaScript

  // You can add more content transformations or additional cleanup logic
  return content;
}

module.exports = {
  applyCleaningStrategies
};
