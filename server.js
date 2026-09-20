const express = require('express');
const logger = require('morgan');
const path = require('path');

// Initialise Express
const app = express();
const PORT = 3000;

// Middleware
app.use(logger('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Public HTML, CSS, JavaScript and images
app.use(express.static(path.join(__dirname, 'public')));

// General routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to The Healthy Home server' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Blog routes 
const postsRouter = require('./routes/posts');
app.use('/api', postsRouter);

// Related articles 
const postEmbeddingsRouter = require('./routes/post-embeddings');
app.use('/api/post-embeddings', postEmbeddingsRouter);

// Error handling
app.use((req, res) => {
    res.status(404).json({
        error: 'The requested page or endpoint could not be found.'
    });
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    console.error(error);

    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'The request contains invalid JSON.'
        });
    }

    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'The submitted data is too large.'
        });
    }

    res.status(500).json({
        error: 'Unable to complete your request. Please try again.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Type Ctrl+C to shut down the web server');
});