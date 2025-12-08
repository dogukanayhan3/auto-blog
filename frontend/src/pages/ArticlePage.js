import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { articlesApi } from '../api/client';
import './ArticlePage.css';

// Article Loading Skeleton
const ArticleSkeleton = () => (
  <div className="article-skeleton">
    <div className="skeleton-back shimmer"></div>
    <div className="skeleton-article">
      <div className="skeleton-article-title shimmer"></div>
      <div className="skeleton-article-meta">
        <div className="skeleton-tag shimmer"></div>
        <div className="skeleton-date shimmer"></div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-paragraph shimmer ${i % 4 === 3 ? 'short' : ''}`}
          style={{ marginBottom: i === 7 ? 0 : '12px' }}
        ></div>
      ))}
    </div>
  </div>
);

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [previousArticle, setPreviousArticle] = useState(null);
  const [optimisticArticle, setOptimisticArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState(null);

  // Keep a reference to the latest successful article for optimistic updates
  useEffect(() => {
    if (article) {
      setPreviousArticle(article);
    }
  }, [article]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchArticle = async () => {
      setError(null);
      setOptimisticArticle(previousArticle || null);
      setTransitioning(Boolean(previousArticle));
      setLoading(!previousArticle); // show skeleton only when nothing to show yet

      try {
        const response = await articlesApi.getOne(slug);
        if (!isSubscribed) return;
        setArticle(response.data);
        setOptimisticArticle(response.data);
      } catch (err) {
        console.error('Error loading article:', err);
        if (!isSubscribed) return;
        setError('This article could not be loaded right now.');
      } finally {
        if (!isSubscribed) return;
        setLoading(false);
        setTransitioning(false);
      }
    };

    fetchArticle();
    return () => {
      isSubscribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleBack = () => navigate('/');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const displayedArticle = optimisticArticle || article;

  if (loading && !displayedArticle) {
    return (
      <div className="article-page">
        <div className="container">
          <ArticleSkeleton />
        </div>
      </div>
    );
  }

  if (!displayedArticle) {
    return (
      <div className="article-page">
        <div className="container">
          <div className="error-card">
            <p className="error-message">{error || 'Article not found'}</p>
            <button onClick={handleBack} className="back-button">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="container">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={16} />
          <span>Back to Insights</span>
        </button>

        {error && (
          <div className="inline-warning">
            {error} Showing the last available version instead.
          </div>
        )}

        <div className={`article-content ${transitioning ? 'is-transitioning' : ''}`}>
          <div className="article-header">
            <p className="article-pill">AI generated insight</p>
            <h1>{displayedArticle.title}</h1>
            <div className="article-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <span>{formatDate(displayedArticle.createdAt)}</span>
              </div>
              {displayedArticle.topic && (
                <div className="meta-item">
                  <Tag size={16} />
                  <span className="topic-tag">{displayedArticle.topic}</span>
                </div>
              )}
            </div>
          </div>

          <div className="article-body">
            {displayedArticle.content
              .split('\n')
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
