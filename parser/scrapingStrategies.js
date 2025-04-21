const customRules = {
  'bbc.com': {
    articleSelector: 'article',
    contentSelector: '.ssrcss-1q0x1qg-Paragraph', // Example class for BBC
  },
  'nytimes.com': {
    articleSelector: 'section',
    contentSelector: '.css-1gb49c0', // Example class for NY Times
  },
  // Add more sites as needed
};

module.exports = customRules;
