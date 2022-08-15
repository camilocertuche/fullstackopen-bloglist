const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  return response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body);
  blog.likes = blog.likes ? blog.likes : 0;

  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: "title and url are required" });
  }

  const result = await blog.save();

  response.status(201).json(result);
});

blogRouter.delete("/:id", async (request, response) => {
  const result = await Blog.findByIdAndRemove(request.params.id);

  if (result) {
    return response.status(204).end();
  }

  response.status(404).end();
});

module.exports = blogRouter;
