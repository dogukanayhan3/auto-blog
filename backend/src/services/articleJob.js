const cron = require('node-cron');
const aiClient = require('./aiClient');
const db = require('../models/db');

class ArticleJob {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  async generateAndSaveArticle() {
    if (this.isRunning) {
      console.log('⏳ Article generation already in progress...');
      return null;
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
      return null;
    } finally {
      this.isRunning = false;
    }
  }

  startDailyJob() {
    // Get schedule from environment variable or use defaults
    // Format: CRON_SCHEDULE="*/1 * * * *" for every minute
    //         CRON_SCHEDULE="*/10 * * * * *" for every 10 seconds (with seconds support)
    //         CRON_SCHEDULE="0 9 * * *" for daily at 9 AM
    const customSchedule = process.env.CRON_SCHEDULE;
    const isDev = process.env.NODE_ENV === 'development';
    
    let schedule;
    let description;

    if (customSchedule) {
      schedule = customSchedule;
      description = `custom schedule: ${customSchedule}`;
    } else if (isDev) {
      // In development: every 5 minutes for testing
      schedule = '*/5 * * * *';
      description = 'every 5 minutes (development mode)';
    } else {
      // In production: every day at 9:00 AM
      schedule = '0 9 * * *';
      description = 'daily at 9:00 AM (production mode)';
    }

    console.log('⏰ Scheduling article generation:', description);
    console.log('📅 Cron pattern:', schedule);

    this.cronJob = cron.schedule(schedule, async () => {
      const timestamp = new Date().toISOString();
      console.log(`\n⏰ Cron job triggered at ${timestamp}`);
      await this.generateAndSaveArticle();
    });

    console.log('✅ Cron job scheduled successfully');
  }

  stopJob() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏹️ Cron job stopped');
    }
  }

  // Manual trigger for testing
  async triggerManual() {
    console.log('🔧 Manual article generation triggered');
    return await this.generateAndSaveArticle();
  }
}

module.exports = new ArticleJob();