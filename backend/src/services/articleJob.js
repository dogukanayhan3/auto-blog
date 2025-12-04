const cron = require('node-cron');
const aiClient = require('./aiClient');
const db = require('../models/db');

class ArticleJob {
  constructor() {
    this.isRunning = false;
  }

  async generateAndSaveArticle() {
    if (this.isRunning) {
      console.log('⏳ Article generation already in progress...');
      return;
    }

    try {
      this.isRunning = true;
      console.log('🚀 Starting article generation...');

      const articleData = await aiClient.generateArticle();
      const article = await db.createArticle(articleData);

      console.log('✅ Article generated successfully:', article.title);
      return article;

    } catch (error) {
      console.error('❌ Failed to generate article:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  // Schedule job to run daily at 9:00 AM
  startDailyJob() {
    console.log('⏰ Scheduling daily article generation (9:00 AM)');
    
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', () => {
      console.log('⏰ Daily cron job triggered');
      this.generateAndSaveArticle();
    });

    // Also run every hour for testing (comment out in production)
    // cron.schedule('0 * * * *', () => {
    //   console.log('⏰ Hourly test cron job triggered');
    //   this.generateAndSaveArticle();
    // });
  }

  // Manual trigger for testing
  async triggerManual() {
    console.log('🔧 Manual article generation triggered');
    return await this.generateAndSaveArticle();
  }
}

module.exports = new ArticleJob();