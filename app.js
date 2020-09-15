const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

const list = [];

app.get('/', (req, res) => {
  const today = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };

  const day = today.toLocaleDateString('en-GB', options);

  res.render('list', { day, list });
});

app.post('/', (req, res) => {
  const indexes = [];

  Object.entries(req.body).forEach((item) => {
    if (item[1] === 'on') {
      indexes.push(item[0]);
    }
  });

  const checkedItems = [];

  indexes.forEach((index) => {
    checkedItems.push(list[index]);
  });

  checkedItems.forEach((checkedItem) => {
    const checkedItemIndex = list.indexOf(checkedItem);
    list.splice(checkedItemIndex, 1);
  });

  const { newItem } = req.body;

  if (newItem) {
    const newItemIndex = list.indexOf(newItem);
    if (newItemIndex === -1) list.push(newItem);
  }

  res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`App is running on port ${process.env.PORT || 3000}`);
});
