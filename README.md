# Northcoders News API

This project is a backend API for accessing application data programmatically, intended to mimic the building of a real world backend service (such as Reddit) which should provide this information to the front end architecture.

## Setup Instructions

To run this project locally, follow these steps:

### 1. **Clone the Repository**

Clone the repository to your local machine. Replace `YOUR_USERNAME` with your GitHub username:

git clone https://github.com/YOUR_USERNAME/Nc-news-project.git

### 2. **Create new repository on Git and set a remote branch**

Get a remote branch. Replace `YOUR_NEW_REPO_URL_HERE` with the URL of your new repo in Git.

cd path to the clone project
git init
git remote add origin YOUR_NEW_REPO_URL_HERE

### 2. **Create the env. Files**

Create `.env.development` and `.env.test` files with:

PGDATABASE=nc_news
PGDATABASE=nc_news_test

### 3. **Modify .gitignore file**

Add `.env.*` to the file to prevent for being tracked by Git.

### 4. **Install Dependencies & Create Database**

Install npm with the command "npm i"
Create the db with the command "psql -f db/setup.sql"

### 5. **Check .Pgpass file and Permissions**

Add localhost:port:database_name:user_name:password for the connection with both databases.
Ensure to run the command "chmod 600 ~/.pgpass" to give permissions.

### 6. **Seed the Database**

Run the command "npm run seed"

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
