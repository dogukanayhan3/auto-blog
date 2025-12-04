import React, { useState, useEffect } from 'react';
import { articlesApi } from '../api/client';
import ArticleCard from '../components/ArticleCard';
// We create a local Skeleton component (or you can move this to its own file)
import './HomePage.css';

// 1. Define the Skeleton Component for the "Loading" state
const ArticleSkeleton = () => (
  <div className="article-card skeleton-card">
    <div className="skeleton-image shimmer"></div>
    <div className="skeleton-content">
      <div className="skeleton-title shimmer"></div>
      <div className="skeleton-text shimmer"></div>
      <div className="skeleton-text short shimmer"></div>
      <div className="skeleton-tag shimmer"></div>
    </div>
  </div>
);

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getAll();
      setArticles(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load articles. Please try again later.');
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic to retry if error occurs
  if (error) {
    return (
      <div className="home-page">
        <div className="container error-container">
          <div className="error-card">
            <h3>Oops!</h3>
            <p className="error-message">{error}</p>
            <button onClick={fetchArticles} className="retry-button">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Main Render
  return (
    <div className="home-page">
      <div className="container">
        <header className="page-header">
          <div className="header-badge">New Updates</div>
          <h1>Latest Insights</h1>
          <p className="subtitle">
            Curated AI-generated technology articles for you
          </p>
        </header>

        <div className="articles-grid">
          {loading ? (
            // 4. Optimistic UI / Skeleton Loading
            // We render 6 dummy skeletons while waiting
            Array.from({ length: 6 }).map((_, index) => (
              <ArticleSkeleton key={index} />
            ))
          ) : articles.length === 0 ? (
            <div className="no-articles">
              <p>No articles yet. Check back soon!</p>
            </div>
          ) : (
            // 5. Actual Content
            articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;