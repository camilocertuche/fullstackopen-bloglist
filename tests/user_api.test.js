const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const bcrypt = require("bcrypt");
const User = require("../models/user");
const { usersInDb } = require("./test_helper");

describe("Create a new user", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = bcrypt.hashSync("sekret", 10);
    const user = new User({
      username: "test",
      name: "test",
      passwordHash,
    });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "testPassword",
    };

    await api.post("/api/users").send(newUser).expect(201);

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with status 400 with a non-unique username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "test",
      name: "test",
      password: "testPassword",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toContain("user already exists");

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("creation fails with status 400 with a missing username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      name: "test",
      password: "testPassword",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toBe("missing username or password");

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("creation fails with status 400 with a missing password", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      user: "test",
      username: "test1234",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toBe("missing username or password");

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("creation fails with status 400 when username is not string", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 1234,
      name: "test",
      password: "testPassword",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toBe("username must be a string");

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("creation fails with status 400 when password is not string", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "test",
      name: "test",
      password: 1234,
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toBe("password must be a string");

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("creation fails with status 400 when username is too short", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "te",
      name: "test",
      password: "testPassword",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toBe(
      "username must be at least 3 characters long"
    );

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("creation fails with status 400 when password is too short", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "test",
      name: "test",
      password: "se",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);
    expect(result.body.error).toBe(
      "password must be at least 3 characters long"
    );

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
