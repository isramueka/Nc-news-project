const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const articleData = require("../db/data/test-data/articles");
const commentData = require("../db/data/test-data/comments");
const topicData = require("../db/data/test-data/topics");
const userData = require("../db/data/test-data/users");

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

describe("/api", () => {
  test("GET: 200 responds with an object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const endpoints = response.body.endpoints;
        // Check if the endpoints object contains all expected keys
        expect(endpoints).toMatchObject({
          "GET /api": expect.objectContaining({
            description: expect.any(String),
          }),
          "GET /api/topics": expect.objectContaining({
            description: expect.any(String),
            queries: expect.any(Array),
            exampleResponse: expect.any(Object),
          }),
          "GET /api/articles": expect.objectContaining({
            description: expect.any(String),
            queries: expect.any(Array),
            exampleResponse: expect.any(Object),
          }),
        });
        // Ensure there are keys in the endpoints object
        expect(Object.keys(endpoints).length).toBeGreaterThan(0);
      });
  });
});
