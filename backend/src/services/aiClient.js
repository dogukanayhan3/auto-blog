const axios = require('axios');

class AIClient {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.apiUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  getRandomTopic() {
    const topics = [
      'artificial intelligence and machine learning',
      'web development best practices',
      'cloud computing and DevOps',
      'cybersecurity trends',
      'mobile app development',
      'blockchain and cryptocurrency',
      'data science and analytics',
      'software architecture patterns',
      'frontend frameworks comparison',
      'backend technologies overview',
      'microservices architecture',
      'containerization with Docker',
      'continuous integration and deployment',
      'agile development methodologies',
      'user experience design principles',
      'database optimization techniques',
      'API design and REST principles',
      'serverless computing',
      'progressive web applications',
      'testing and quality assurance'
    ];
    
    return topics[Math.floor(Math.random() * topics.length)];
  }

  async generateArticle() {
    try {
      const topic = this.getRandomTopic();
      
      const prompt = `Write a professional blog article about ${topic}. 
      
The article should:
- Have an engaging title
- Be 400-600 words long
- Include an introduction, main points, and conclusion
- Be informative and well-structured
- Use a professional but accessible tone

Format:
Title: [Your Title Here]

[Article content here]`;

      console.log('🤖 Generating article about:', topic);

      const response = await axios.post(
        this.apiUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      const generatedText = response.data[0]?.generated_text || response.data.generated_text;
      
      // Parse title and content
      const lines = generatedText.split('\n').filter(line => line.trim());
      let title = '';
      let content = '';

      // Extract title
      const titleLine = lines.find(line => line.startsWith('Title:'));
      if (titleLine) {
        title = titleLine.replace('Title:', '').trim();
        const titleIndex = lines.indexOf(titleLine);
        content = lines.slice(titleIndex + 1).join('\n\n').trim();
      } else {
        // If no explicit title, use first line as title
        title = lines[0].trim();
        content = lines.slice(1).join('\n\n').trim();
      }

      // Clean up title (remove quotes or special characters)
      title = title.replace(/^["']|["']$/g, '').trim();
      
      // If title is too long, truncate it
      if (title.length > 100) {
        title = title.substring(0, 97) + '...';
      }

      // If content is too short, use the whole generated text
      if (content.length < 200) {
        content = generatedText;
        title = `Exploring ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
      }

      const slug = this.generateSlug(title);

      return {
        title,
        content,
        slug,
        topic
      };

    } catch (error) {
      console.error('❌ Error generating article:', error.message);
      
      // Fallback: Create a simple article if AI fails
      const topic = this.getRandomTopic();
      const title = `Introduction to ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
      const slug = this.generateSlug(title);
      
      return {
        title,
        content: `This is an auto-generated article about ${topic}. 

${topic.charAt(0).toUpperCase() + topic.slice(1)} is an important topic in modern technology. It encompasses various aspects that developers and engineers need to understand.

In this article, we explore the fundamentals and provide insights into best practices and current trends in the field.

Whether you're a beginner or an experienced professional, understanding ${topic} is crucial for staying current in the tech industry.`,
        slug,
        topic
      };
    }
  }
}

module.exports = new AIClient();