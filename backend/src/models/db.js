const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/articles.json');

class Database {
  constructor() {
    this.initDB();
  }

  async initDB() {
    try {
      await fs.access(DB_PATH);
    } catch (error) {
      // File doesn't exist, create it with empty array
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify([], null, 2));
      console.log('📁 Database initialized');
    }
  }

  async readDB() {
    try {
      const data = await fs.readFile(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);
      return [];
    }
  }

  async writeDB(data) {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing to database:', error);
      return false;
    }
  }

  async getAllArticles() {
    const articles = await this.readDB();
    // Sort by date, newest first
    return articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getArticleById(id) {
    const articles = await this.readDB();
    return articles.find(article => article.id === id);
  }

  async getArticleBySlug(slug) {
    const articles = await this.readDB();
    return articles.find(article => article.slug === slug);
  }

  async createArticle(articleData) {
    const articles = await this.readDB();
    
    const newArticle = {
      id: Date.now().toString(),
      ...articleData,
      createdAt: new Date().toISOString(),
    };

    articles.push(newArticle);
    await this.writeDB(articles);
    
    console.log('✅ Article created:', newArticle.title);
    return newArticle;
  }

  async deleteArticle(id) {
    const articles = await this.readDB();
    const filteredArticles = articles.filter(article => article.id !== id);
    await this.writeDB(filteredArticles);
    return true;
  }
}

module.exports = new Database();