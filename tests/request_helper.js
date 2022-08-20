const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);

const buildRequest = (TOKEN) => {
  const hook =
    (method = "post") =>
    (args) =>
      api[method](args).set("Authorization", `bearer ${TOKEN}`);

  const request = {
    post: hook("post"),
    get: hook("get"),
    put: hook("put"),
    delete: hook("delete"),
  };

  return request;
};

module.exports = buildRequest;
