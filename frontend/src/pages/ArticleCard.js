import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import './ArticleCard.css';

const ArticleCard = ({ article, style }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getExcerpt = (content, length = 120) => {
    if (content.length <= length) return content;
    return content.substring(0, length).trim() + '...';
  };

  // Get pastel color based on topic
  const getTopicColor = (topic) => {
    const colors = {
      'artificial-intelligence': '#e4d9ff',
      'machine-learning': '#ffd7ba',
      'web-development': '#c7f0db',
      'cloud-computing': '#d4e4f7',
      'cybersecurity': '#ffc4d6',
      'mobile-development': '#fff4cc',
      'blockchain': '#e4d9ff',
      'data-science': '#ffd7ba',
      'devops': '#c7f0db',
      'software-architecture': '#d4e4f7',
    };
    return colors[topic] || '#f0f0f0';
  };

  return (
    <Link to={`/article/${article.slug}`} className="article-card-link" style={style}>
      <article className="article-card">
        <div 
          className="article-icon"
          style={{ backgroundColor: getTopicColor(article.topic) }}
        >
          <span className="icon-letter">
            {article.title.charAt(0).toUpperCase()}
          </span>
        </div>

        <h2 className="article-title">{article.title}</h2>
        
        <p className="article-excerpt">{getExcerpt(article.content)}</p>

        <div className="article-footer">
          <span className="article-topic" style={{ backgroundColor: getTopicColor(article.topic) }}>
            {article.topic?.replace(/-/g, ' ')}
          </span>
          
          <div className="article-meta">
            <Calendar size={14} />
            <span className="article-date">{formatDate(article.createdAt)}</span>
          </div>
        </div>

        <div className="article-hover-arrow">
          <ArrowRight size={20} />
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;