const cron = require('node-cron');
const aiClient = require('./aiClient');
const db = require('../models/db');

const articleJob = {
  startDailyJob: () => {
    const isDev = process.env.NODE_ENV === 'development';
    
    // In development: every hour (for testing)
    // In production: every day at 9 AM UTC
    const schedule = isDev ? '0 * * * *' : '0 9 * * *';
    const scheduleDesc = isDev ? 'every hour' : 'daily at 9 AM UTC';

    console.log(`⏰ Scheduling article generation: ${scheduleDesc}`);

    cron.schedule(schedule, async () => {
      try {
        console.log(`🤖 Running scheduled article generation at ${new Date().toISOString()}`);
        const articleData = await aiClient.generateArticle();
        const article = db.createArticle(articleData);
        console.log(`✅ Scheduled article created: "${article.title}"`);
      } catch (error) {
        console.error('❌ Error in scheduled job:', error.message);
      }
    });
  },
};

module.exports = articleJob;