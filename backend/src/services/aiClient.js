const axios = require('axios');

class AIClient {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    if (!this.apiKey) {
      throw new Error('❌ OPENAI_API_KEY is required but not set!');
    }
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  getRandomTopic() {
    const topics = [
      'Artificial Intelligence and Machine Learning',
      'Web Development Best Practices',
      'Cloud Computing and DevOps',
      'Cybersecurity Trends',
      'Mobile App Development',
      'Blockchain and Cryptocurrency',
      'Data Science and Analytics',
      'Software Architecture Patterns',
      'Frontend Frameworks Comparison',
      'Backend Technologies Overview',
      'Microservices Architecture',
      'Containerization with Docker',
      'Continuous Integration and Deployment',
      'Agile Development Methodologies',
      'User Experience Design Principles',
      'Database Optimization Techniques',
      'API Design and REST Principles',
      'Serverless Computing',
      'Progressive Web Applications',
      'Testing and Quality Assurance'
    ];
    
    return topics[Math.floor(Math.random() * topics.length)];
  }

  async generateArticle() {
    try {
      const topic = this.getRandomTopic();
      
      const prompt = `Write a professional blog article about ${topic}.

Requirements:
- Write an engaging title
- Write 400-600 words
- Include introduction, main points, and conclusion
- Use professional but accessible tone
- Be informative and well-structured

Format your response EXACTLY like this:
TITLE: [Your engaging title here]

[Introduction paragraph]

[Main content paragraphs]

[Conclusion paragraph]`;

      console.log('🤖 Generating article about:', topic);

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional blog writer. Write high-quality, informative articles.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 1,
          max_completion_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      console.log('📥 Response received from OpenAI');

      const generatedText = response.data.choices[0]?.message?.content || '';

      if (!generatedText || generatedText.trim().length < 50) {
        throw new Error('Generated text is too short or empty');
      }

      // Parse title and content
      let title = '';
      let content = '';

      // Try to find title
      const titleMatch = generatedText.match(/TITLE:\s*(.+?)[\n\r]/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
        // Get content after title
        const contentStart = generatedText.indexOf(titleMatch[0]) + titleMatch[0].length;
        content = generatedText.substring(contentStart).trim();
      } else {
        // If no title found, use first line as title
        const lines = generatedText.split('\n').filter(line => line.trim());
        title = lines[0]?.trim() || `Introduction to ${topic}`;
        content = lines.slice(1).join('\n\n').trim();
      }

      // Clean up title
      title = title
        .replace(/^["'`]+|["'`]+$/g, '')
        .replace(/^TITLE:\s*/i, '')
        .trim();
      
      // If title is too long, truncate it
      if (title.length > 100) {
        title = title.substring(0, 97) + '...';
      }

      // Clean up content
      content = content.trim();

      const slug = this.generateSlug(title);

      const article = {
        title,
        content,
        slug,
        topic: topic.toLowerCase().replace(/\s+/g, '-')
      };

      console.log('✅ Article generated successfully');
      console.log('📰 Title:', title);
      console.log('📏 Content length:', content.length, 'characters');

      return article;

    } catch (error) {
      console.error('❌ Error generating article:', error.message);
      
      if (error.response) {
        console.error('API Error Status:', error.response.status);
        console.error('API Error Data:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw error;
    }
  }
}

module.exports = new AIClient();