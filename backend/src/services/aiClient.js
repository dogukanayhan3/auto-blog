const axios = require('axios');

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';

if (!HUGGINGFACE_API_KEY) {
  console.warn('⚠️  HUGGINGFACE_API_KEY not set!');
}

const aiClient = {
  generateArticle: async () => {
    try {
      console.log('🤖 Generating article with HuggingFace AI...');

      const topics = ['AI', 'Machine Learning', 'Technology', 'Web Development', 'Cloud Computing', 'Data Science'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];

      const prompt = `Write a blog post about "${randomTopic}". 
The post should be:
- 300-400 words long
- Well-structured with 3-4 paragraphs
- Professional and informative
- Start with a compelling introduction
- End with a conclusion

Format: Return ONLY the article content, no title.`;

      const response = await axios.post(
        API_URL,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new Error('Empty response from HuggingFace');
      }

      const content = response.data[0]?.generated_text || response.data[0];
      
      // Extract just the generated content (remove prompt)
      const lines = content.split('\n');
      const generatedContent = lines.slice(1).join('\n').trim();

      // Generate a title based on topic
      const titles = {
        'AI': 'The Future of Artificial Intelligence',
        'Machine Learning': 'Understanding Machine Learning: A Beginner\'s Guide',
        'Technology': 'Latest Technology Trends in 2025',
        'Web Development': 'Modern Web Development Best Practices',
        'Cloud Computing': 'Cloud Computing: Benefits and Challenges',
        'Data Science': 'Data Science and Its Impact on Business',
      };

      const article = {
        title: titles[randomTopic] || `Exploring ${randomTopic}`,
        content: generatedContent || `This is an article about ${randomTopic}. ${generateDummyContent()}`,
        topic: randomTopic.toLowerCase().replace(' ', '-'),
      };

      console.log(`✅ Article generated: "${article.title}"`);
      return article;
    } catch (error) {
      console.error('❌ AI Client Error:', error.message);
      
      // Fallback: Generate dummy article if API fails
      console.log('📝 Using fallback article generation...');
      return generateFallbackArticle();
    }
  },
};

// Fallback article generator (for testing without API)
function generateFallbackArticle() {
  const topics = ['AI', 'Machine Learning', 'Technology', 'Web Development', 'Cloud Computing', 'Data Science'];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  const fallbackArticles = {
    'AI': {
      title: 'The Future of Artificial Intelligence',
      content: `Artificial intelligence is rapidly transforming the world around us. From autonomous vehicles to medical diagnostics, AI technologies are becoming increasingly integrated into our daily lives. In this article, we explore the key developments and future prospects of AI.\n\nThe evolution of AI has been marked by significant breakthroughs. Machine learning algorithms, deep neural networks, and natural language processing have revolutionized how we approach problem-solving. Companies are investing billions into AI research, recognizing its potential to drive innovation and efficiency.\n\nThe applications of AI are vast and varied. In healthcare, AI is being used to detect diseases earlier and more accurately. In finance, it's improving fraud detection and risk assessment. In retail, it's personalizing customer experiences. As we move forward, we can expect AI to become even more sophisticated and integrated into every aspect of our society.\n\nHowever, with great power comes great responsibility. We must ensure that AI is developed and deployed ethically, with consideration for privacy, security, and societal impact.`,
      topic: 'ai',
    },
    'Machine Learning': {
      title: 'Understanding Machine Learning: A Beginner\'s Guide',
      content: `Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It's one of the most exciting fields in computer science today.\n\nAt its core, machine learning works by identifying patterns in data. The more data a machine learning model processes, the better it becomes at making predictions or decisions. This is fundamentally different from traditional programming, where developers explicitly write instructions for every scenario.\n\nThere are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning. Supervised learning involves training models on labeled data, where the correct answers are already provided. Unsupervised learning finds patterns in unlabeled data. Reinforcement learning trains models through rewards and penalties.\n\nMachine learning is already transforming industries. From recommendation systems that suggest products you might like, to predictive maintenance in manufacturing, to autonomous systems, machine learning is everywhere. As the field continues to evolve, we'll see even more innovative applications.`,
      topic: 'machine-learning',
    },
    'Technology': {
      title: 'Latest Technology Trends in 2025',
      content: `The technology landscape is constantly evolving, and 2025 promises to be an exciting year for innovation. Let's explore some of the key trends shaping the future of technology.\n\nQuantum computing is finally moving from theory to practical applications. Companies are developing quantum processors that could solve problems currently impossible for classical computers. This could revolutionize cryptography, drug discovery, and optimization.\n\nEdge computing is becoming increasingly important as IoT devices proliferate. Instead of sending all data to centralized cloud servers, edge computing processes data locally on devices or edge servers. This reduces latency and improves privacy.\n\nCybersecurity threats are evolving rapidly, and so are defense mechanisms. AI-powered security systems can now detect and respond to threats in real-time. Zero-trust architecture is becoming the new standard for network security.\n\nThe convergence of technologies is creating new possibilities. AR and VR are becoming more immersive and practical. Blockchain is moving beyond cryptocurrency into supply chain and identity management. Sustainable tech is becoming a priority as organizations work to reduce their carbon footprint.`,
      topic: 'technology',
    },
    'Web Development': {
      title: 'Modern Web Development Best Practices',
      content: `Web development has evolved significantly over the years. Today's best practices emphasize performance, security, and user experience. Let's dive into what makes modern web development effective.\n\nResponsive design is no longer optional—it's essential. With users accessing websites from various devices, ensuring your site works seamlessly across all screen sizes is crucial. Mobile-first design approaches have become the standard.\n\nPerformance optimization directly impacts user experience and SEO rankings. Techniques like lazy loading, code splitting, and image optimization can dramatically improve page load times. Modern tools like webpack and Vite make implementing these optimizations easier than ever.\n\nSecurity should be a primary concern throughout the development process. Using HTTPS, implementing content security policies, and protecting against common vulnerabilities like XSS and CSRF are fundamental.\n\nFrontend frameworks like React, Vue, and Angular have revolutionized how we build web applications. These frameworks promote component-based architecture, making code more maintainable and reusable. The ecosystem around these frameworks continues to grow and mature.`,
      topic: 'web-development',
    },
    'Cloud Computing': {
      title: 'Cloud Computing: Benefits and Challenges',
      content: `Cloud computing has fundamentally changed how organizations manage their IT infrastructure. The shift from on-premises servers to cloud services offers numerous advantages, but also presents new challenges.\n\nThe benefits of cloud computing are substantial. Scalability is one of the biggest advantages—you can easily increase or decrease your resources based on demand. Cost efficiency is another major benefit; you only pay for what you use. Cloud providers handle maintenance and updates, freeing up IT teams to focus on strategic initiatives.\n\nDifferent cloud service models serve different needs. Infrastructure as a Service (IaaS) provides virtual computing resources. Platform as a Service (PaaS) offers development tools and databases. Software as a Service (SaaS) delivers applications directly to users.\n\nHowever, cloud computing comes with challenges. Data security and compliance are ongoing concerns. Organizations must ensure their data is protected and meets regulatory requirements. Vendor lock-in is another consideration—switching providers can be complex and costly.\n\nThe future of cloud computing involves edge computing, serverless architecture, and increased focus on security and compliance. Organizations need to carefully evaluate their cloud strategy to maximize benefits while mitigating risks.`,
      topic: 'cloud-computing',
    },
    'Data Science': {
      title: 'Data Science and Its Impact on Business',
      content: `Data science has become a critical business function in the digital age. Organizations that effectively leverage data science gain significant competitive advantages.\n\nData science combines statistics, mathematics, and programming to extract insights from data. These insights inform business decisions, from marketing strategies to product development to operational efficiency. The value of data science lies not just in analyzing historical data, but in predicting future trends.\n\nMachine learning models are central to modern data science. These models can identify patterns that humans might miss, enabling predictive analytics and automated decision-making. However, data quality is crucial—garbage in, garbage out.\n\nEthical considerations are increasingly important in data science. Issues around bias in algorithms, privacy of personal data, and responsible use of AI need careful attention. Organizations must establish ethical frameworks for data science projects.\n\nThe demand for data scientists continues to grow. These professionals need diverse skills including programming, statistics, machine learning, and domain expertise. As organizations collect more data, the importance of data science expertise will only increase.`,
      topic: 'data-science',
    },
  };

  return fallbackArticles[randomTopic] || fallbackArticles['Technology'];
}

function generateDummyContent() {
  return `This is a test article. In a production environment, this would be generated by the HuggingFace AI API.`;
}

module.exports = aiClient;