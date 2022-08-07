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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
