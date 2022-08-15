const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");
const { initialBlogs, nonExistingId, blogsInDb } = require("./test_helper");

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogs = initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogs.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe("when there is initially some blogs saved", () => {
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
});

describe("addition of a new blog", () => {
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

  test("if likes is not defined, it is set to 0", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "https://test-url.com/",
    };

    const addedBlog = await api.post("/api/blogs").send(newBlog).expect(201);

    const blogs = await api.get("/api/blogs");

    expect(blogs.body).toHaveLength(initialBlogs.length + 1);
    expect(addedBlog.body.title).toBe(newBlog.title);
    expect(addedBlog.body.author).toBe(newBlog.author);
    expect(addedBlog.body.url).toBe(newBlog.url);
    expect(addedBlog.body.likes).toBeDefined();
    expect(addedBlog.body.likes).toBe(0);
  });

  test("if title is not defined, the request is rejected", async () => {
    const newBlog = {
      author: "Test Author",
      url: "https://test-url.com/",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test("if url is not defined, the request is rejected", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogs = await blogsInDb();
    const blogToDelete = blogs[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
  });

  test("fails with statuscode 404 if note does not exist", async () => {
    const validNonexistingId = await nonExistingId();
    console.log(validNonexistingId);

    await api.delete(`/api/blogs/${validNonexistingId}`).expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";

    await api.delete(`/api/blogs/${invalidId}`).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
