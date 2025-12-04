const express = require('express');
const router = express.Router();
const db = require('../models/db');
const aiClient = require('../services/aiClient');

// GET all articles
router.get('/', (req, res) => {
  try {
    const articles = db.getAllArticles();
    res.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
    });
  }
});

// GET single article by ID or slug
router.get('/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to get by ID first
    let article = db.getArticleById(identifier);
    
    // If not found, try by slug
    if (!article) {
      article = db.getArticleBySlug(identifier);
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('❌ Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
    });
  }
});

// POST generate new article (manual trigger)
router.post('/generate', async (req, res) => {
  try {
    console.log('🔧 Manual article generation requested...');
    
    const articleData = await aiClient.generateArticle();
    
    if (!articleData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate article - no data returned',
      });
    }

    const article = db.createArticle(articleData);

    res.json({
      success: true,
      message: 'Article generated and saved successfully',
      data: article,
    });
  } catch (error) {
    console.error('❌ Error generating article:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate article',
    });
  }
});

module.exports = router;