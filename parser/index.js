const extractContent = require('./extractContent');

async function parse(url) {
  try {
    const result = await extractContent(url);
    return {
      title: result.title || '',
      content: result.content || '',
      author: result.author || '',
      date_published: result.date_published || '',
      lead_image_url: result.lead_image_url || '',
      dek: '',
      url,
      domain: '',
      excerpt: '',
      word_count: result.content ? result.content.split(' ').length : 0,
      direction: 'ltr',
      total_pages: 1,
      rendered_pages: 1
    };
  } catch (error) {
    console.error('Error parsing article:', error);
    throw new Error('Failed to parse article');
  }
}

module.exports = {
  parse
};
