const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce(function (sum, blog) {
    return sum + blog.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  let favorite = blogs[0];

  for (let blog of blogs) {
    if (blog.likes > favorite.likes) {
      favorite = blog;
    }
  }

  return favorite;
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;

  // Group blogs by author
  const grouped = _.groupBy(blogs, "author");

  // Transform to an array of { author, blogs } objects
  const blogCounts = _.map(grouped, (authorBlogs, author) => ({
    author,
    blogs: authorBlogs.length,
  }));

  // Find the one with the most blogs
  return _.maxBy(blogCounts, "blogs");
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
