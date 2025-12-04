import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi } from '../api/client';
import Loading from '../components/Loading';
import './ArticlePage.css';

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getOne(slug);
      setArticle(response.data);
      setError(null);
    } catch (err) {
      setError('Article not found');
      console.error('Error loading article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !article) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Article not found'}</p>
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="container">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
        
        <div className="article-content">
          <div className="article-header">
            <h1>{article.title}</h1>
            <div className="article-meta">
              <span>{formatDate(article.createdAt)}</span>
              {article.topic && (
                <span className="topic-tag">{article.topic}</span>
              )}
            </div>
          </div>
          
          <div className="article-body">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;