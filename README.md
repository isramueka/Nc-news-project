# Northcoders News API

This project is a backend API for managing articles, topics, users, and comments, mimicking a real-world backend service. This API can be used by frontend applications to interact with structured data, similar to services like Reddit.

This project is hosted at:
https://nc-news-project-fd36.onrender.com/

Remember to add `/api/endpoints` to check any of the available!

## Setup Instructions

To run this project locally, follow these steps:

### 1. **Clone the Repository**

Clone the repository to your local machine. Replace `your-repository-name` with your GitHub repository name:

```bash
git clone https://github.com/isramueka/your-repository-name.git
```

### 2. **Create the env. Files**

Create `.env.development` and `.env.test` files in the root directory of your project. For the specific database names, please refer to the `db/setup.sql` file in the repository.

### 3. **Modify .gitignore file**

Add `.env.*` to the .gitignore file to prevent them from being tracked by Git.

### 4. **Install Dependencies & Create Database**

Install npm dependencies:

```bash
npm i
```

Create the database:

```bash
psql -f db/setup.sql
```

### 5. **Check .Pgpass file & Permissions**

Add the following to your .pgpass file for the connection with both databases:

`localhost:5432:database_name:user_name:password`

Ensure permissions with:

```bash
chmod 600 ~/.pgpass
```

### 6. **Seed the Database**

Run the seed with:

```bash
npm run seed
```

### 7. **Run Tests**

To run tests, use the following command:

```bash
npm test
```

### 8. **Minimum Version Requirements**

Ensure that you have the following versions installed:

-Node.js: v18.x or higher
-PostgreSQL: v14.x or higher

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
