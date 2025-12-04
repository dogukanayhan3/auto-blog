import React, { useState, useEffect } from 'react';
import { articlesApi } from '../api/client';
import ArticleCard from '../components/ArticleCard';
import Loading from '../components/Loading';
import './HomePage.css';

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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchArticles} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="container">
        <div className="page-header">
          <h1>Latest Articles</h1>
          <p className="subtitle">
            AI-generated insights and technology articles
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="no-articles">
            <p>No articles yet. Check back soon!</p>
          </div>
        ) : (
          <div className="articles-list">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;