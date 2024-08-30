# Northcoders News API

This project is a backend API for managing articles, topics, users, and comments, mimicking a real-world backend service. This API can be used by frontend applications to interact with structured data, similar to services like Reddit.

This project is hosted at:
https://nc-news-project-fd36.onrender.com/

Remember to add `/api/endpoints` to check any of the available!

## Setup Instructions

To run this project locally, follow these steps:

### 1. **Clone the Repository**

Clone the repository to your local machine. Replace `YOUR_USERNAME` with your GitHub username:

```bash
git clone https://github.com/YOUR_USERNAME/your-repository-name.git
```

### 2. **Create new repository on Git and set a remote branch**

Get a remote branch. Replace `YOUR_NEW_REPO_URL_HERE` with the URL of your new repo in Git.

```bash
cd path to the clone project
git init
git remote add origin YOUR_NEW_REPO_URL_HERE
```

### 3. **Create the env. Files**

Create `.env.development` and `.env.test` files in the root directory of your project with the following content:

PGDATABASE=nc_news
PGDATABASE=nc_news_test

### 4. **Modify .gitignore file**

Add `.env.*` to the .gitignore file to prevent them from being tracked by Git.

### 5. **Install Dependencies & Create Database**

Install npm dependencies:

```bash
npm i
```

Create the database:

```bash
psql -f db/setup.sql
```

### 6. **Check .Pgpass file & Permissions**

Add the following to your .pgpass file for the connection with both databases:

`localhost:5432:database_name:user_name:password`

Ensure permissions with:

```bash
chmod 600 ~/.pgpass
```

### 7. **Seed the Database**

Run the seed with:

```bash
npm run seed
```

### 8. **Run Tests**

To run tests, use the following command:

```bash
npm test
```

### 9. \*\*Minimum Version Requirements

Ensure that you have the following versions installed:

-Node.js: v18.x or higher
-PostgreSQL: v14.x or higher

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
