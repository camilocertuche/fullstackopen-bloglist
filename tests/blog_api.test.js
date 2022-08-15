const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");
const { initialBlogs } = require("./test_helper");

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogs = initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogs.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const blogs = await api.get("/api/blogs");
  expect(blogs.body).toHaveLength(initialBlogs.length);
});

test("the unique identifier property of the blog posts is named id", async () => {
  const blogs = await api.get("/api/blogs");
  expect(blogs.body[0].id).toBeDefined();
});

test("successfully adds a new blog post", async () => {
  const newBlog = {
    title: "Test Blog",
    author: "Test Author",
    url: "https://test-url.com/",
    likes: 100,
  };

  const addedBlog = await api.post("/api/blogs").send(newBlog).expect(201);

  const blogs = await api.get("/api/blogs");

  expect(blogs.body).toHaveLength(initialBlogs.length + 1);
  expect(addedBlog.body.title).toBe(newBlog.title);
  expect(addedBlog.body.author).toBe(newBlog.author);
  expect(addedBlog.body.url).toBe(newBlog.url);
  expect(addedBlog.body.likes).toBe(newBlog.likes);
});

afterAll(() => {
  mongoose.connection.close();
});
