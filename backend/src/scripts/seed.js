const db = require('../models/db');
const aiClient = require('../services/aiClient');

async function seedArticles() {
  try {
    console.log('🌱 Seeding initial articles...');
    
    const articles = await db.getAllArticles();
    if (articles.length > 0) {
      console.log(`✅ Articles already exist (${articles.length} found), skipping seed`);
      process.exit(0);
    }

    console.log('📝 Generating 5 initial articles...');
    
    for (let i = 0; i < 5; i++) {
      console.log(`  [${i + 1}/5] Generating article...`);
      const articleData = await aiClient.generateArticle();
      await db.createArticle(articleData);
      // Delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('✅ Seeding complete!');
    console.log('📊 Total articles:', db.getAllArticles().length);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedArticles();