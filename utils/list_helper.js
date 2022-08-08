const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes;
  };
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  if (!blogs.length) return null;

  const likesList = blogs.map((blog) => blog.likes);
  const max = Math.max(...likesList);

  const favorite = blogs.find((blog) => blog.likes === max);
  const { title, author, likes } = favorite;
  return { title, author, likes };
};

const mostBlogs = (blogs) => {
  if (!blogs.length) return null;

  let result = {};

  blogs.forEach((blog) => {
    if (result[blog.author]) {
      result[blog.author]++;
    } else {
      result[blog.author] = 1;
    }
  });

  const max = Math.max(...Object.values(result));
  const mostBlogsAuthor = Object.keys(result).find(
    (author) => result[author] === max
  );

  return { author: mostBlogsAuthor, blogs: max };
};

const mostLikes = (blogs) => {
  if (!blogs.length) return null;

  let result = {};

  blogs.forEach((blog) => {
    if (result[blog.author]) {
      result[blog.author] += blog.likes;
    } else {
      result[blog.author] = blog.likes;
    }
  });

  const max = Math.max(...Object.values(result));
  const mostLikedAuthor = Object.keys(result).find(
    (key) => result[key] === max
  );

  return { author: mostLikedAuthor, likes: max };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
