const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const articleData = require("../db/data/test-data/articles");
const commentData = require("../db/data/test-data/comments");
const topicData = require("../db/data/test-data/topics");
const userData = require("../db/data/test-data/users");
const endpointsJSON = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => seed({ articleData, commentData, topicData, userData }));
afterAll(() => db.end());

describe("/api/topics", () => {
  test("GET: 200 responds with an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topicsArray = response.body.topics;
        expect(Array.isArray(topicsArray)).toBe(true);
        expect(topicsArray.length).toBeGreaterThan(0);
        topicsArray.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("/api", () => {
  test("GET: 200 responds with an object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const responseEndpoints = response.body.endpoints;
        expect(responseEndpoints).toEqual(endpointsJSON);
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET: 200 responds with an article object including article_img_url", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article).toMatchObject({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comments_count: expect.any(Number),
        });
      });
  });

  test("GET: 400 responds with an error message for invalid article ID", () => {
    return request(app)
      .get("/api/articles/invalidID")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid input");
      });
  });

  test("GET: 404 responds with an error message for non-existent article", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article Not Found");
      });
  });
});

describe("/api/articles", () => {
  test("GET: 200 responds with all an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comments_count: expect.any(Number),
            })
          );
          expect(article).not.toHaveProperty("body");
        });
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET: 200 responds with an array of comments for the given article_id, sorted by date descending", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments).toHaveLength(10);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });

  test("GET: 200 responds with an empty array when an article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body.comments)).toBe(true);
        expect(response.body.comments).toHaveLength(0);
      });
  });

  test("GET: 400 responds with an error message for invalid article ID datatype", () => {
    return request(app)
      .get("/api/articles/invalidID/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid input");
      });
  });

  test("GET: 404 responds with an error message for non-existent article_id", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("No comments found for this article");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("POST: 201 responds with the posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge", body: "Great article!" })
      .expect(201)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          article_id: 1,
          author: "butter_bridge",
          body: "Great article!",
          created_at: expect.any(String),
          votes: expect.any(Number),
        });
      });
  });

  test("POST: 201 responds with the posted comment while ignoring unnecessary properties", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "Another comment.",
        randomProperty: "should be ignored",
      })
      .expect(201)
      .then(({ body }) => {
        const comment = body.comment;
        expect(comment).toHaveProperty("comment_id");
        expect(comment).toHaveProperty("author", "butter_bridge");
        expect(comment).toHaveProperty("body", "Another comment.");
        expect(comment).not.toHaveProperty("randomProperty");
      });
  });

  test("POST: 400 responds with an error message for missing fields", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ body: "Great article!" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Missing required fields: username and body"
        );
      });
  });

  test("POST: 400 responds with an error message for invalid article_id", () => {
    return request(app)
      .post("/api/articles/invalidID/comments")
      .send({ username: "butter_bridge", body: "Great article!" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid input");
      });
  });
});

test("POST: 404 responds with an error message for non-existent article_id", () => {
  return request(app)
    .post("/api/articles/999999/comments")
    .send({ username: "butter_bridge", body: "Great article!" })
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe("Article not found for id: 999999");
    });
});

test("POST: 404 responds with an error when username does not exist", () => {
  return request(app)
    .post("/api/articles/1/comments")
    .send({
      username: "not_a_user",
      body: "This comment will not be accepted.",
    })
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Username not found");
    });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH: 200 responds with the updated article", () => {
    return request(app)
      .get("/api/articles/1")
      .then((res) => {
        const initialVotes = res.body.article.votes;
        return request(app)
          .patch("/api/articles/1")
          .send({ upd_votes: 1 })
          .expect(200)
          .then((response) => {
            expect(response.body.article.votes).toBe(initialVotes + 1);
          });
      });
  });

  test("PATCH: 400 responds with an error message for invalid 'upd_votes'", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ upd_votes: "string" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid input");
      });
  });

  test("PATCH: 400 responds with an error message for invalid article_id", () => {
    return request(app)
      .patch("/api/articles/invalidID")
      .send({ upd_votes: 1 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid input");
      });
  });

  test("PATCH: 404 responds with an error message for non-existent article_id", () => {
    return request(app)
      .patch("/api/articles/999999")
      .send({ upd_votes: 1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article Not Found");
      });
  });

  test("PATCH: 400 responds with an error message for missing 'upd_votes'", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Missing required field");
      });
  });
});

describe("/api/comments/:comment_id", () => {
  test("DELETE: 204 responds with no content and successfully deletes a comment", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("DELETE: 400 responds with an error message for invalid comment_id datatype", () => {
    return request(app)
      .delete("/api/comments/invalidID")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid input");
      });
  });

  test("DELETE: 404 responds with an error message for non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/999999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment Not Found");
      });
  });
});

describe("/api/users", () => {
  test("GET: 200 responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const users = response.body.users;
        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe("/api/articles", () => {
  test("GET: 200 - responds with articles sorted by votes in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });

  test("GET: 200 - responds with articles sorted by title in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy("title", { ascending: true });
      });
  });

  test("GET: 400 - responds with error when sort_by column is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid sort_by column");
      });
  });

  test("GET: 400 - responds with error when order value is invalid", () => {
    return request(app)
      .get("/api/articles?order=invalid_order")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid order value");
      });
  });
});

describe("/api/articles", () => {
  test("GET: 200 responds with articles filtered by topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("GET: 200 responds with an empty array if a valid topic exists but has no associated articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toEqual([]);
      });
  });

  test("GET: 404 responds with an error message for an invalid topic query", () => {
    return request(app)
      .get("/api/articles?topic=notTopic")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid topic value");
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: responds with the user object when the user exists", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((response) => {
        const user = response.body.user;
        expect(user).toEqual({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });

  test("404: responds with an error when the user does not exist", () => {
    return request(app)
      .get("/api/users/nonexistentuser")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("User Not Found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: responds with the updated comment when valid input is provided", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment).toEqual({
          comment_id: 1,
          votes: 17,
          created_at: "2020-04-06T12:17:00.000Z",
          author: "butter_bridge",
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          article_id: 9,
        });
      });
  });

  test("400: responds with an error for invalid input", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "not-a-number" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid input for votes");
      });
  });

  test("404: responds with an error when the comment does not exist", () => {
    return request(app)
      .patch("/api/comments/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment Not Found");
      });
  });
});

describe("POST /api/articles", () => {
  test("201: should post a new article and return it with the correct properties", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "New Article",
      body: "This is a test article body",
      topic: "mitch",
      article_img_url: "https://testimage.com/image.jpg",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            author: "butter_bridge",
            title: "New Article",
            body: "This is a test article body",
            topic: "mitch",
            article_img_url: "https://testimage.com/image.jpg",
            created_at: expect.any(String),
            votes: 0,
            comment_count: 0,
          })
        );
      });
  });

  test("400: should return an error when a required field is missing", () => {
    const newArticle = {
      author: "butter_bridge",
      body: "This is a new article body",
      topic: "mitch",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Missing required fields: author, title, body, topic and article_img_url"
        );
      });
  });
});

describe("GET /api/articles", () => {
  test("200: should return paginated articles and total count", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeLessThanOrEqual(5);
        expect(typeof total_count).toBe("number");
        expect(total_count).toBeGreaterThanOrEqual(0);
      });
  });

  test("400: should handle invalid limit and page parameters", () => {
    return request(app)
      .get("/api/articles?limit=notANumber&p=1")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid limit value");
      });
  });

  test("404: should handle invalid topic value", () => {
    return request(app)
      .get("/api/articles?topic=invalidTopic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid topic value");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with comments with default pagination", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(10);
        expect(body.total_count).toBeGreaterThan(10); // Assuming there are more than 10 comments
      });
  });

  test("200: accepts limit query to return limited number of comments", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(5);
        expect(body.total_count).toBeGreaterThan(5);
      });
  });

  test("200: accepts p query to paginate the results", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(5);
      });
  });

  describe("/api/articles/:article_id/comments", () => {
    test("GET: 200 - responds with an array of comments for the given article_id, sorted by date descending", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments, total_count } = body;
          expect(Array.isArray(comments)).toBe(true);
          expect(comments).toHaveLength(10);
          expect(total_count).toBeGreaterThan(10);
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
        });
    });

    test("GET: 200 - responds with paginated comments for page 2", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5&p=2")
        .expect(200)
        .then(({ body }) => {
          const { comments, total_count } = body;
          expect(comments).toHaveLength(5);
          expect(total_count).toBeGreaterThan(5);
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
        });
    });

    test("GET: 400 - responds with error when invalid limit is passed", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=invalid")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid input");
        });
    });

    test("GET: 400 - responds with error when invalid page is passed", () => {
      return request(app)
        .get("/api/articles/1/comments?p=invalid")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid input");
        });
    });
  });
});

describe("POST /api/topics", () => {
  test("should create a new topic and return the topic object", () => {
    const newTopic = {
      slug: "new-topic",
      description: "This is a new topic",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body }) => {
        expect(body.topic).toEqual(expect.objectContaining(newTopic));
      });
  });

  test("should return 400 error if missing required fields", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "new-topic" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing required fields: slug and description");
      });
  });

  test("should respond with error if topic already exists", () => {
    const existingTopic = {
      slug: "cats",
      description: "Not dogs",
    };

    return request(app)
      .post("/api/topics")
      .send(existingTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic already exists");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("should delete an article and its comments and respond with status 204", async () => {
    let articleId;
    const postResponse = await request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "Test Article",
        body: "This is a test article.",
        topic: "mitch",
        article_img_url: "https://testimage.com/image.jpg",
      })
      .expect(201);

    articleId = postResponse.body.article.article_id;

    // Add a comment
    await request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send({ username: "butter_bridge", body: "Test comment" })
      .expect(201);

    // Delete article
    await request(app).delete(`/api/articles/${articleId}`).expect(204);

    await request(app).get(`/api/articles/${articleId}`).expect(404);

    // Ensure the comments associated are deleted
    await request(app).get(`/api/articles/${articleId}/comments`).expect(404);
  });

  test("should respond with 204 for a non-existent article_id", async () => {
    await request(app).delete("/api/articles/999999").expect(204);
  });

  test("should respond with 400 for an invalid article_id", async () => {
    await request(app).delete("/api/articles/invalid_id").expect(400);
  });
});
