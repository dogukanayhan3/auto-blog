import React from 'react';
import { Link } from 'react-router-dom';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getExcerpt = (content, length = 150) => {
    if (content.length <= length) return content;
    return content.substring(0, length).trim() + '...';
  };

  return (
    <div className="article-card">
      <div className="article-card-header">
        <h2 className="article-title">
          <Link to={`/article/${article.slug}`}>{article.title}</Link>
        </h2>
        <p className="article-date">{formatDate(article.createdAt)}</p>
      </div>
      <p className="article-excerpt">{getExcerpt(article.content)}</p>
      <Link to={`/article/${article.slug}`} className="read-more">
        Read More →
      </Link>
    </div>
  );
};

export default ArticleCard;