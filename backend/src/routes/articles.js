const express = require('express');
const router = express.Router();
const db = require('../models/db');
const articleJob = require('../services/articleJob');

// GET /api/articles - Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await db.getAllArticles();
    res.json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles'
    });
  }
});

// GET /api/articles/:identifier - Get single article by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let article = await db.getArticleById(identifier);
    
    if (!article) {
      article = await db.getArticleBySlug(identifier);
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article'
    });
  }
});

// POST /api/articles/generate - Manual trigger for article generation (for testing)
router.post('/generate', async (req, res) => {
  try {
    const article = await articleJob.triggerManual();
    
    if (!article) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate article'
      });
    }

    res.json({
      success: true,
      message: 'Article generated successfully',
      data: article
    });
  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate article'
    });
  }
});

module.exports = router;