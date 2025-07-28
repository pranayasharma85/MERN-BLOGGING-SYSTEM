# MERN Blog with Naive Bayes Machine Learning

A full-stack MERN blog application with an integrated Naive Bayes machine learning algorithm implemented from scratch for content classification, sentiment analysis, and personalized recommendations.

## 🚀 Features

### Core Application
- **MERN Stack**: MongoDB, Express.js, React.js, Node.js
- **User Authentication**: JWT-based authentication system
- **Blog Management**: Create, edit, delete, and manage blog posts
- **User Interactions**: Like, comment, and review posts
- **Admin Dashboard**: User and content management

### Machine Learning (Naive Bayes from Scratch)
- **Content Classification**: Automatically categorize blog posts
- **Sentiment Analysis**: Analyze user comments and reviews
- **Personalized Recommendations**: ML-powered content recommendations
- **User Preference Analysis**: Understand user behavior patterns
- **Content Insights**: Analytics and trends using ML

## 🏗️ Project Structure

```
Mern-blog/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── context/       # React context
├── server/                # Node.js backend
│   ├── utils/
│   │   └── naiveBayes.js  # Core Naive Bayes implementation
│   ├── services/
│   │   └── mlService.js   # ML service integration
│   ├── controllers/
│   │   ├── mlController.js # ML API endpoints
│   │   └── ...           # Other controllers
│   ├── routes/
│   │   ├── mlRoutes.js    # ML API routes
│   │   └── ...           # Other routes
│   ├── models/            # MongoDB models
│   ├── demo/
│   │   └── naiveBayesDemo.js # Demo scripts
│   ├── test/
│   │   └── testNaiveBayes.js # Test scripts
│   └── ML_README.md       # Detailed ML documentation
└── README.md              # This file
```

## 🧠 How the Naive Bayes Algorithm Works

### 1. Mathematical Foundation

The Naive Bayes algorithm is based on Bayes' Theorem:

```
P(class|features) = P(class) × ∏ P(feature|class)
```

Where:
- `P(class|features)`: Probability of a class given the features
- `P(class)`: Prior probability of the class
- `P(feature|class)`: Likelihood of a feature given the class

### 2. Implementation Components

#### A. Text Preprocessing
```javascript
preprocessText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !this.isStopWord(word));
}
```

#### B. TF-IDF Feature Extraction
```javascript
createTFIDFFeatures(texts) {
  // Calculate Term Frequency (TF)
  // Calculate Inverse Document Frequency (IDF)
  // Combine for TF-IDF scores
}
```

#### C. Laplace Smoothing
```javascript
// Prevents zero probability issues
P(feature|class) = (count + 1) / (total + vocabulary_size)
```

### 3. Three Variants Implemented

#### A. Multinomial Naive Bayes
- **Use Case**: Text classification with word frequency
- **Best For**: Content categorization, sentiment analysis
- **Formula**: Uses word counts in documents

#### B. Bernoulli Naive Bayes
- **Use Case**: Binary word presence/absence
- **Best For**: Document classification
- **Formula**: Uses presence/absence of words

#### C. Gaussian Naive Bayes
- **Use Case**: Numerical features
- **Best For**: Continuous data
- **Formula**: Uses normal distribution

## 📊 Where Trained Models Are Stored

### 1. In-Memory Storage (Current Implementation)
The trained models are stored in memory during runtime:

```javascript
// In mlService.js
class MLService {
  constructor() {
    this.categoryClassifier = new NaiveBayes('multinomial');
    this.sentimentClassifier = new NaiveBayes('multinomial');
    this.userPreferenceClassifier = new NaiveBayes('bernoulli');
    this.isTrained = false;
  }
}
```

**Location**: `server/services/mlService.js`

### 2. Model State
Models are trained and stored in memory with these properties:
- `classProbabilities`: Prior probabilities for each class
- `featureProbabilities`: Conditional probabilities for features
- `vocabulary`: Set of unique words
- `classes`: Set of unique classes
- `isTrained`: Boolean flag indicating training status

### 3. Model Persistence
Currently, models are retrained on server restart. For production, you can add:

```javascript
// Save model to file
const fs = require('fs');
fs.writeFileSync('model.json', JSON.stringify(modelState));

// Load model from file
const modelState = JSON.parse(fs.readFileSync('model.json'));
```

## 🎯 How to Find Prediction Accuracy

### 1. Model Performance Metrics
Access via API endpoint:

```bash
GET /api/ml/performance
```

Response:
```json
{
  "categoryClassifier": {
    "type": "multinomial",
    "classes": ["technology", "business", "sports"],
    "vocabularySize": 150
  },
  "sentimentClassifier": {
    "type": "multinomial", 
    "classes": ["positive", "negative", "neutral"],
    "vocabularySize": 200
  }
}
```

### 2. Accuracy Testing
Run the test script:

```bash
cd server
node test/testNaiveBayes.js
```

### 3. Demo with Accuracy Metrics
Run the demo script:

```bash
cd server
node demo/naiveBayesDemo.js
```

### 4. Custom Accuracy Testing
```javascript
// Test accuracy on your data
const classifier = new NaiveBayes('multinomial');
classifier.fit(trainingData.texts, trainingData.labels);

const accuracy = classifier.score(testData.texts, testData.labels);
console.log(`Accuracy: ${(accuracy * 100).toFixed(2)}%`);
```

## 🔧 How the Algorithm Works in Your Repository

### 1. Training Process

#### A. Data Collection
```javascript
// From your blog posts
const posts = await Post.find().populate('creator', 'username');
```

#### B. Feature Extraction
```javascript
// Prepare training data
const categoryData = this.prepareCategoryData(posts);
const sentimentData = this.prepareSentimentData(posts);
```

#### C. Model Training
```javascript
// Train each classifier
this.categoryClassifier.fit(categoryData.texts, categoryData.labels);
this.sentimentClassifier.fit(sentimentData.texts, sentimentData.labels);
```

### 2. Prediction Process

#### A. Content Classification
```javascript
// When creating a new post
const classification = mlService.classifyPostCategory(title, description);
// Returns: { predictedCategory: "technology", confidence: 0.85 }
```

#### B. Sentiment Analysis
```javascript
// When analyzing comments
const sentiment = mlService.analyzeSentiment(comment);
// Returns: { sentiment: "positive", confidence: 0.92 }
```

#### C. Personalized Recommendations
```javascript
// When user requests recommendations
const recommendations = await mlService.getPersonalizedRecommendations(userId);
// Returns: Array of recommended posts with scores
```

### 3. Integration Points

#### A. API Endpoints
```javascript
// ML Routes in server/routes/mlRoutes.js
router.post('/train', protect, mlController.trainModels);
router.get('/recommendations/:userId', protect, mlController.getMLRecommendations);
router.post('/classify-category', protect, mlController.classifyPostCategory);
```

#### B. Service Integration
```javascript
// In server/services/mlService.js
class MLService {
  async trainModels() { /* Training logic */ }
  classifyPostCategory(title, description) { /* Classification */ }
  analyzeSentiment(comment) { /* Sentiment analysis */ }
  async getPersonalizedRecommendations(userId) { /* Recommendations */ }
}
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend  
cd client
npm install
```

### 2. Environment Setup
Create `.env` file in server directory:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

### 3. Train ML Models
```bash
# Start server
cd server
npm run dev

# Train models via API
curl -X POST http://localhost:5000/api/ml/train \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test the Implementation
```bash
# Run tests
cd server
node test/testNaiveBayes.js

# Run demo
node demo/naiveBayesDemo.js
```

## 📈 Performance Metrics

### Expected Accuracy
- **Category Classification**: 85-90% (with good training data)
- **Sentiment Analysis**: 80-85%
- **Recommendations**: Personalized based on user behavior

### Scalability
- Handles thousands of training samples
- Efficient prediction for real-time use
- Memory-efficient vocabulary storage

## 🛠️ API Usage Examples

### 1. Train Models
```bash
curl -X POST http://localhost:5000/api/ml/train \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Recommendations
```bash
curl -X GET http://localhost:5000/api/ml/recommendations/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Classify Post Category
```bash
curl -X POST http://localhost:5000/api/ml/classify-category \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Machine Learning Basics",
    "description": "Introduction to ML algorithms..."
  }'
```

### 4. Analyze Sentiment
```bash
curl -X POST http://localhost:5000/api/ml/analyze-sentiment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"comment": "Great article!"}'
```

## 🔍 Key Files and Their Purposes

### Core ML Implementation
- `server/utils/naiveBayes.js`: Complete Naive Bayes algorithm from scratch
- `server/services/mlService.js`: Integration service for ML functionality
- `server/controllers/mlController.js`: API endpoints for ML features
- `server/routes/mlRoutes.js`: ML API routes

### Testing and Demo
- `server/test/testNaiveBayes.js`: Comprehensive test suite
- `server/demo/naiveBayesDemo.js`: Interactive demo with examples
- `server/ML_README.md`: Detailed ML documentation

### Integration
- `server/index.js`: Updated to include ML routes
- `server/models/postModel.js`: Blog post data structure
- `server/models/userModel.js`: User data structure

## 🎯 Use Cases in Your Blog

### 1. Content Classification
- Automatically categorize new blog posts
- Improve content organization
- Enable better search and filtering

### 2. Sentiment Analysis
- Monitor user feedback sentiment
- Identify trending topics
- Improve content quality

### 3. Personalized Recommendations
- Show relevant content to users
- Increase user engagement
- Improve user experience

### 4. Content Insights
- Analyze content performance
- Identify popular categories
- Track user preferences

## 🔮 Future Enhancements

1. **Model Persistence**: Save trained models to disk
2. **Real-time Learning**: Update models with new data automatically
3. **Advanced Features**: Named entity recognition, topic modeling
4. **Performance Optimization**: Caching, parallel processing
5. **A/B Testing**: Compare ML vs traditional recommendations

## 📚 Mathematical Background

### Naive Bayes Formula
```
P(class|features) = P(class) × ∏ P(feature|class)
```

### Laplace Smoothing
```
P(feature|class) = (count + 1) / (total + vocabulary_size)
```

### TF-IDF
```
TF-IDF = TF × log(N / DF)
```

---

**Note**: This is a from-scratch implementation for educational and practical purposes. For production use with large datasets, consider using established ML libraries like scikit-learn or TensorFlow.js. 
