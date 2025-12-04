require('dotenv').config();
const db = require('../models/db');
const aiClient = require('../services/aiClient');

async function seedArticles() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    const existingArticles = db.getAllArticles();
    
    if (existingArticles.length >= 3) {
      console.log(`✅ Database already has ${existingArticles.length} articles`);
      console.log('   Skipping seed process\n');
      process.exit(0);
    }

    const articlesToGenerate = 3 - existingArticles.length;
    console.log(`📝 Generating ${articlesToGenerate} initial articles...\n`);
    
    for (let i = 0; i < articlesToGenerate; i++) {
      console.log(`📄 [${i + 1}/${articlesToGenerate}] Generating article...`);
      
      try {
        const articleData = await aiClient.generateArticle();
        const article = db.createArticle(articleData);
        console.log(`   ✅ Created: "${article.title}"\n`);
      } catch (error) {
        console.error(`   ❌ Failed to generate article ${i + 1}:`, error.message);
        console.log('   ⏭️ Continuing with next article...\n');
      }
      
      // Wait between requests to avoid rate limiting
      if (i < articlesToGenerate - 1) {
        console.log('   ⏳ Waiting 3 seconds before next generation...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    const finalArticles = db.getAllArticles();
    console.log('✅ Seeding complete!');
    console.log(`📊 Total articles in database: ${finalArticles.length}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedArticles();