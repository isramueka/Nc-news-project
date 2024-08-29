const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const articleData = require("../db/data/test-data/articles");
const commentData = require("../db/data/test-data/comments");
const topicData = require("../db/data/test-data/topics");
const userData = require("../db/data/test-data/users");
const endpointsJSON = require("../endpoints.json");

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
        // Ensuring topicsArray is not empty for handling false positive
        expect(topicsArray.length).toBeGreaterThan(0);
        topicsArray.forEach((topic) => {
          // Use MatchObject instead toHaveProperty
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

// Refactor of the Test as Requested in (PR#2)
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

// Refactor of the (PR#3) as we now the actual result
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
        });
      });
  });

  // Add test for invalidID
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

// Add check of length as requested in (PR#4)
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
        // Expecting length of Comments for article with id = 1
        expect(comments).toHaveLength(11);
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

  // Added test for no comments article as requested (PR#5)
  test("GET: 200 responds with an empty array when an article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body.comments)).toBe(true);
        expect(response.body.comments).toHaveLength(0);
      });
  });

  // Added test for invalidID requested (PR#5)
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

  // Added new property as requested on (PR#6)
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
        // Ensure it is ignored
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
    // Check how many votes there are to expect 1 more
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
        expect(response.body.msg).toBe(
          "Invalid input: 'upd_votes' must be a number"
        );
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
        expect(response.body.msg).toBe(
          "Invalid input: 'upd_votes' must be a number"
        );
      });
  });
});
