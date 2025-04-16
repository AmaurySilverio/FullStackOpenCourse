const { test, after } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const assert = require("node:assert");
const Blog = require("../models/blog");
const app = require("../app");

const api = supertest(app);

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

const { beforeEach } = require("node:test");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("blogs returned from database have id property, not _id", async () => {
  const blogs = await Blog.find({});
  assert.ok(blogs.length !== 0, "No blogs in database to test");

  const blog = blogs[0].toJSON(); // Convert the first blog to plain object

  assert.ok(blog.id); // Has 'id'
  assert.strictEqual(typeof blog.id, "string");
  assert.strictEqual(blog._id, undefined); // Does not have '_id'
});

test("a valid blog can be added ", async () => {
  const newBlog = {
    title: "async/await simplifies making async calls",
    author: "Naruto Uzumaki",
    url: "https://test.com",
    likes: 8,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");

  const title = response.body.map((r) => r.title);

  assert.strictEqual(response.body.length, initialBlogs.length + 1);

  assert(title.includes("async/await simplifies making async calls"));
});

test("if like property is missing, default value will be zero", async () => {
  const newBlog = {
    title: "How to create a beautiful website",
    author: "Minato Uzumaki",
    url: "https://test.com",
  };

  const response = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  assert.strictEqual(response.body.likes, 0);
});

test("blog without title is not added and returns 400", async () => {
  const newBlog = {
    author: "Missing Title",
    url: "https://missing-title.com",
    likes: 1,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);
});

test("blog without url is not added and returns 400", async () => {
  const newBlog = {
    title: "Missing URL",
    author: "Test Author",
    likes: 3,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);
});

test("a blog can be deleted", async () => {
  // First, add a blog to delete
  const newBlog = {
    title: "Delete this blog",
    author: "Test Author",
    url: "https://delete.com",
    likes: 0,
  };

  const savedResponse = await api.post("/api/blogs").send(newBlog).expect(201);

  const blogToDelete = savedResponse.body;

  // Now delete the blog
  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  // Fetch all blogs and ensure it's gone
  const blogsAfter = await api.get("/api/blogs");
  const titles = blogsAfter.body.map((b) => b.title);

  assert(!titles.includes("Delete this blog"));
});

test("a blog's likes can be updated", async () => {
  // First, create a blog to update
  const newBlog = {
    title: "Blog to update",
    author: "Updater",
    url: "https://update.com",
    likes: 0,
  };

  const created = await api.post("/api/blogs").send(newBlog).expect(201);
  const blogToUpdate = created.body;

  // Update the likes
  const updated = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ likes: 42 })
    .expect(200);

  assert.strictEqual(updated.body.likes, 42);
});

after(async () => {
  await mongoose.connection.close();
});
