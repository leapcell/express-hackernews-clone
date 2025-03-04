// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

// Create an Express application
const app = express();
// Set the port, use environment variable PORT or default to 3000
const port = process.env.PORT || 3000;

// Configure PostgreSQL connection pool using DSN from environment variable
const pool = new Pool({
    connectionString: process.env.DSN,
});

// Middleware setup
// Use body-parser to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the '../public' directory
app.use(express.static(path.join(__dirname, '../public')));
// Set EJS as the view engine
app.set('view engine', 'ejs');
// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// Function to check if a table exists and create it if not
const checkAndCreateTable = async (tableName, createQuery) => {
    try {
        // SQL query to check if the table exists in the 'public' schema
        // $1 is a placeholder for the table name
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            );
        `, [tableName]);
        // If the table does not exist, create it
        if (!result.rows[0].exists) {
            await pool.query(createQuery);
            console.log(`${tableName} table has been created.`);
        }
    } catch (error) {
        console.error(`Error creating ${tableName} table:`, error);
    }
};

// Define table creation queries
// SQL query to create the 'posts' table
const postsTableQuery = `
    CREATE TABLE posts (
        id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
        title VARCHAR(255) NOT NULL, -- Post title, max 255 characters
        link VARCHAR(255) NOT NULL DEFAULT '', -- Post link, default empty
        content TEXT NOT NULL, -- Post content
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Creation time
    );
`;
// SQL query to create the 'comments' table
const commentsTableQuery = `
    CREATE TABLE comments (
        id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
        content TEXT NOT NULL, -- Comment content
        post_id INTEGER NOT NULL, -- ID of the related post
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Creation time
        FOREIGN KEY (post_id) REFERENCES posts(id) -- Foreign key referencing 'posts' table
    );
`;

// Check and create tables on application startup
checkAndCreateTable('posts', postsTableQuery);
checkAndCreateTable('comments', commentsTableQuery);

// Route to display the list of posts
app.get('/', async (req, res) => {
    try {
        // SQL query to select all posts ordered by creation time in descending order
        const { rows } = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        const posts = [];
        for (const row of rows) {
            // SQL query to count comments for a specific post
            const commentsResult = await pool.query('SELECT COUNT(*) FROM comments WHERE post_id = $1', [row.id]);
            let commentCount = 0;
            if (commentsResult.rows.length > 0) {
                commentCount = commentsResult.rows[0].count;
            }
            posts.push({ 
                id: row.id,
                title: row.title,
                link: row.link,
                host: row.link ? new URL(row.link).hostname : '',
                content: row.content,
                created_at: row.created_at || new Date(),
                comment_count: commentCount,
            });
        }
        // Render the 'index' view with the posts data
        res.render('index', { posts: posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to add a new post
app.post('/new', async (req, res) => {
    const { title, content, link } = req.body;
    try {
        // SQL query to insert a new post into the 'posts' table
        await pool.query('INSERT INTO posts (title, content, link, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)', [title, content, link]);
        res.redirect('/');
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display a single post and its comments
app.get('/post/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        // SQL query to select a single post by ID
        const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
        const post = postResult.rows[0];
        if (!post) {
            return res.status(404).send('Post not found');
        }
        // SQL query to select all comments for a specific post ordered by creation time in descending order
        const commentsResult = await pool.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC', [postId]);
        const comments = [];
        for (const row of commentsResult.rows) {
            comments.push({
                id: row.id,
                content: row.content,
                created_at: row.created_at || new Date(),
            });
        }
        // Render the 'post-detail' view with the post and its comments
        res.render('post-detail', { 
            post: {
                id: post.id,
                title: post.title,
                link: post.link,
                host: post.link ? new URL(post.link).hostname : '',
                content: post.content,
                created_at: post.created_at || new Date(),
                comments: comments,
            }
         });
    } catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to add a comment to a post
app.post('/post/:id/comment', async (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    try {
        // SQL query to insert a new comment into the 'comments' table
        await pool.query('INSERT INTO comments (content, post_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)', [content, postId]);
        res.redirect(`/post/${postId}`);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});