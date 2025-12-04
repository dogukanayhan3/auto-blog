const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 Created data directory');
}

// Ensure articles.json exists
if (!fs.existsSync(ARTICLES_FILE)) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify([], null, 2));
  console.log('📄 Created articles.json file');
}

const db = {
  // Get all articles
  getAllArticles: () => {
    try {
      const data = fs.readFileSync(ARTICLES_FILE, 'utf-8');
      const articles = JSON.parse(data) || [];
      // Sort by creation date, newest first
      return articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('❌ Error reading articles:', error);
      return [];
    }
  },

  // Get article by ID
  getArticleById: (id) => {
    const articles = db.getAllArticles();
    return articles.find(a => a.id === parseInt(id));
  },

  // Get article by slug
  getArticleBySlug: (slug) => {
    const articles = db.getAllArticles();
    return articles.find(a => a.slug === slug);
  },

  // Create new article
  createArticle: (articleData) => {
    try {
      const articles = db.getAllArticles();
      
      // Generate ID
      const id = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
      
      // Create slug from title (or use provided slug)
      const slug = articleData.slug || articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const newArticle = {
        id,
        slug,
        title: articleData.title,
        content: articleData.content,
        topic: articleData.topic || 'general',
        createdAt: new Date().toISOString(),
      };

      articles.push(newArticle);
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
      
      console.log(`✅ Article saved to database: "${newArticle.title}" (ID: ${id})`);
      return newArticle;
    } catch (error) {
      console.error('❌ Error creating article:', error);
      throw error;
    }
  },

  // Delete article (optional)
  deleteArticle: (id) => {
    try {
      const articles = db.getAllArticles();
      const filtered = articles.filter(a => a.id !== parseInt(id));
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(filtered, null, 2));
      console.log(`✅ Article deleted: ID ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting article:', error);
      return false;
    }
  },
};

module.exports = db;