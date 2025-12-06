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
    // If you want custom override for testing via env variables
    const customSchedule = process.env.CRON_SCHEDULE || "35 10 * * *"; // default 10:35:00 for Turkiye time
    const timeZone = "Europe/Istanbul"; // Always Turkiye time

    console.log(`⏰ Scheduling article generation @ 10:35 Turkiye time (${timeZone})`);
    console.log('📅 Cron pattern:', customSchedule);

    this.cronJob = cron.schedule(customSchedule, async () => {
      const timestamp = new Date().toLocaleString("en-GB", { timeZone });
      console.log(`\n⏰ Cron job triggered at ${timestamp} (Turkiye time)`);
      await this.generateAndSaveArticle();
    },{
      scheduled: true,
      timezone: timeZone
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