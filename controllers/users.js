const userRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateUserNameAndPassword } = require("../utils/user_helper");

userRouter.post("/", async (request, response) => {
  const { username, password, name } = request.body;

  const { error } = validateUserNameAndPassword(username, password);
  if (error) {
    return response.status(400).json({ error });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return response.status(400).json({ error: "user already exists" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

userRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
  });
  response.json(users.map((user) => user.toJSON()));
});

module.exports = userRouter;
