# Hacker News Clone (Express + PostgreSQL)

This is a simple Hacker News clone built with Express.js and PostgreSQL. The purpose of this project is to educate users on how to deploy database-dependent applications on Leapcell.

## Features

- Express.js backend
- PostgreSQL database integration
- EJS templating for rendering views

## Project Structure

```
.
├── LICENSE               # License file
├── package.json          # Project metadata and dependencies
└── src/                  # Application source code
    ├── app.js            # Main application entry point
    └── views/            # View templates
        ├── index.ejs     # Homepage displaying the list of posts
        └── post-detail.ejs # Template for displaying post details
```

## Deployment on Leapcell

This guide will walk you through setting up and deploying the project on Leapcell.

### Prerequisites

Ensure you have the following:

- A Leapcell account
- PostgreSQL database instance
- Node.js installed

### Environment Variables

This project requires a PostgreSQL connection string, which should be set using the following environment variable:

```bash
PG_DSN=<your_postgresql_connection_string>
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/leapcell/express-hackernews-clone
   cd express-hackernews-clone
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the project locally, ensure your PostgreSQL instance is running and execute:

```bash
node src/app.js
```

The application will be accessible at `http://localhost:3000`.

### Deploying on Leapcell

1. Push your code to a GitHub repository.
2. Log in to Leapcell and connect your repository.
3. Configure the `PG_DSN` environment variable in the Leapcell deployment settings.
4. Deploy your application.

Once deployed, your application will be accessible via the Leapcell-generated domain.

## Contributing

Feel free to submit issues or pull requests to improve this project.

## Contact

For support, reach out via the Leapcell Discord community or email support@leapcell.io.
