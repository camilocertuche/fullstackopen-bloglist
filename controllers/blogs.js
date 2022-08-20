const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  return response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body);
  const user = request.user;
  blog.likes = blog.likes ? blog.likes : 0;

  if (!(blog.title && blog.url)) {
    return response.status(400).json({ error: "title and url are required" });
  }

  const userFound = await User.findById(user.id);

  blog.user = userFound._id;

  const result = await blog.save();

  userFound.blogs = userFound.blogs.concat(result._id);
  await userFound.save();

  response.status(201).json(result);
});

blogRouter.delete("/:id", async (request, response) => {
  const user = request.user;

  const blogFound = await Blog.findById(request.params.id);

  if (!blogFound) {
    return response.status(404).json({ error: "blog not found" });
  }

  if (blogFound.user.toString() !== user.id) {
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
