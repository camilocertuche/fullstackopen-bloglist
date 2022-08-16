const validateUserNameAndPassword = (username, password) => {
  if (!(username && password)) {
    return { error: "missing username or password" };
  }

  if (typeof username !== "string") {
    return { error: "username must be a string" };
  }

  if (typeof password !== "string") {
    return { error: "password must be a string" };
  }

  if (username.length < 3) {
    return { error: "username must be at least 3 characters long" };
  }

  if (password.length < 3) {
    return { error: "password must be at least 3 characters long" };
  }

  return {};
};

module.exports = { validateUserNameAndPassword };
