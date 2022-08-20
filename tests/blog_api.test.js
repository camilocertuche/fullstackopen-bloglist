const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");
const { initialBlogs, nonExistingId, blogsInDb } = require("./test_helper");
const request = require("./request_helper");

let TOKEN = "";
const USER = { username: "root", name: "root", password: "sekret" };

const createUser = async () => {
  const response = await api.post("/api/users").send(USER);
  return response.body.id;
};

const createBlogs = async (user) => {
  const blogs = initialBlogs.map((blog) => {
    const newblog = new Blog(blog);
    newblog.user = user._id;
    return newblog;
  });

  const promiseArray = blogs.map((blog) => blog.save());
  await Promise.all(promiseArray);
};

const loginUser = async () => {
  const { username, password } = USER;
  const login = await api.post("/api/login").send({ username, password });
  return login;
};

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  const userId = await createUser();
  const user = await User.findById(userId);
  await createBlogs(user);
  const login = await loginUser();

  TOKEN = login.body.token;
}, 10000);

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await request(TOKEN)
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 10000);

  test("all blogs are returned", async () => {
    const blogs = await request(TOKEN).get("/api/blogs");
    expect(blogs.body).toHaveLength(initialBlogs.length);
  }, 10000);

  test("the unique identifier property of the blog posts is named id", async () => {
    const blogs = await request(TOKEN).get("/api/blogs");
    expect(blogs.body[0].id).toBeDefined();
  }, 10000);
});

describe("addition of a new blog", () => {
  test("successfully adds a new blog post", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "https://test-url.com/",
      likes: 100,
    };

    const addedBlog = await request(TOKEN)
      .post("/api/blogs")
      .send(newBlog)
      .expect(201);

    const blogs = await request(TOKEN).get("/api/blogs");

    expect(blogs.body).toHaveLength(initialBlogs.length + 1);
    expect(addedBlog.body.title).toBe(newBlog.title);
    expect(addedBlog.body.author).toBe(newBlog.author);
    expect(addedBlog.body.url).toBe(newBlog.url);
    expect(addedBlog.body.likes).toBe(newBlog.likes);
  }, 10000);

  test("if likes is not defined, it is set to 0", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "https://test-url.com/",
    };

    const addedBlog = await request(TOKEN)
      .post("/api/blogs")
      .send(newBlog)
      .expect(201);

    const blogs = await request(TOKEN).get("/api/blogs");

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

    await request(TOKEN).post("/api/blogs").send(newBlog).expect(400);
  });

  test("if url is not defined, the request is rejected", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
    };

    await request(TOKEN).post("/api/blogs").send(newBlog).expect(400);
  });

  test("fails with the proper status code 401 Unauthorized if a token is not provided", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "https://test-url.com/",
      likes: 100,
    };

    await request("").post("/api/blogs").send(newBlog).expect(401);
  });
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogs = await blogsInDb();
    const blogToDelete = blogs[0];

    await request(TOKEN).delete(`/api/blogs/${blogToDelete.id}`).expect(204);
  });

  test("fails with statuscode 404 if note does not exist", async () => {
    const validNonexistingId = await nonExistingId();

    await request(TOKEN).delete(`/api/blogs/${validNonexistingId}`).expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";

    await request(TOKEN).delete(`/api/blogs/${invalidId}`).expect(400);
  });
});

describe("updating a blog", () => {
  test("succeeds with status code 200 if id is valid", async () => {
    const blogs = await blogsInDb();
    const blogToUpdate = blogs[0];
    const updatedBlog = {
      likes: 120,
    };

    const result = await request(TOKEN)
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200);
    expect(result.body.likes).toBe(updatedBlog.likes);
  });

  test("fails with status code 404 if id not exists", async () => {
    const validNonexistingId = await nonExistingId();

    await request(TOKEN).put(`/api/blogs/${validNonexistingId}`).expect(404);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";

    await request(TOKEN).put(`/api/blogs/${invalidId}`).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
