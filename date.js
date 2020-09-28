module.exports.getDate = () => {
  const today = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  const day = today.toLocaleDateString('en-GB', options);
  return day;
};
