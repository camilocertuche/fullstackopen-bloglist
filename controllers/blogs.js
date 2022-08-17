const jwt = require("jsonwebtoken");
const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  return response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body);
  blog.likes = blog.likes ? blog.likes : 0;

  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: "title and url are required" });
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const user = await User.findById(decodedToken.id);

  blog.user = user._id;

  const result = await blog.save();

  user.blogs = user.blogs.concat(result._id);
  await user.save();

  response.status(201).json(result);
});

blogRouter.delete("/:id", async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const blogFound = await Blog.findById(request.params.id);

  if (!blogFound) {
    return response.status(404).json({ error: "blog not found" });
  }

  if (blogFound.user.toString() !== decodedToken.id) {
    return response.status(403).json({ error: "user cannot delete this blog" });
  }

  const result = await Blog.findByIdAndRemove(request.params.id);

  if (result) {
    return response.status(204).end();
  }

  response.status(404).end();
});

blogRouter.put("/:id", async (request, response) => {
  const blog = { likes: request.body.likes };

  const result = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });

  if (result) {
    return response.status(200).json(result);
  }

  response.status(404).end();
});

module.exports = blogRouter;
