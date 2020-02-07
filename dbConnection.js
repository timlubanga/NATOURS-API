const mongoose = require('mongoose');

let connString =
  'mongodb+srv://timothy:<password>@cluster0-r0jrg.mongodb.net/units?retryWrites=true&w=majority';
connString = connString.replace('<password>', process.env.PASSWORD);

mongoose.connect(connString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected');
});

module.exports = mongoose;
