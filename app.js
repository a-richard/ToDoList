require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require('./date.js');

const app = express();
const { PASSWORD: password } = process.env;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.set('useFindAndModify', false);
mongoose.connect(
  `mongodb+srv://arichard:${password}@todolist.blvz3.mongodb.net/todolistDB?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to DB successfully');
});

const itemSchema = new mongoose.Schema({ name: String });
const listSchema = new mongoose.Schema({ name: String, items: [itemSchema] });

const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model('List', listSchema);

const item1 = new Item({ name: 'Welcome to your ToDo list!' });
const item2 = new Item({ name: 'Hit the + button to add a new item.' });
const item3 = new Item({ name: '<-- Hit this to delete an item.' });
const defaultItems = [item1, item2, item3];

app.get('/', (req, res) => {
  const day = date.getDate();

  Item.find({}, (err, docs) => {
    if (docs.length === 0) {
      Item.insertMany(defaultItems, () => {
        res.redirect('/');
      });
    } else {
      res.render('list', { title: day, todos: docs });
    }
  });
});

app.post('/', (req, res) => {
  const { list } = req.body;
  const { newItem } = req.body;

  const item = new Item({ name: newItem });

  List.findOne({ name: list }, (err, result) => {
    if (!result) {
      item.save();
      res.redirect('/');
    } else {
      result.items.push(item);
      result.save();
      res.redirect(path.join(list));
    }
  });
});

app.get('/:listName', (req, res) => {
  const listName = _.lowerCase(req.params.listName);
  List.findOne({ name: listName }, (err, result) => {
    if (!result) {
      const list = new List({ name: listName, items: defaultItems });
      list.save();
      res.redirect(path.join(listName));
    } else {
      res.render('list', { title: result.name, todos: result.items });
    }
  });
});

app.post('/delete', (req, res) => {
  const { list } = req.body;
  const { checkbox: checkedItemId } = req.body;
  List.findOneAndUpdate(
    { name: list },
    { $pull: { items: { _id: checkedItemId } } },
    (err, result) => {
      if (!result) {
        Item.deleteOne({ _id: checkedItemId }, () => {
          res.redirect('/');
        });
      } else {
        res.redirect(path.join(list));
      }
    }
  );
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`App is running on port ${process.env.PORT || 3000}`);
});
