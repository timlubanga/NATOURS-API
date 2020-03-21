const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: '../../config.env' });
const Tour = require('../../models/toursmodels');
const Users = require('../../models/userModels');
const Reviews = require('../../models/reviewModels');
require(`${__dirname}/../../dbConnection`);

let reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));
let users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));

// // read = read.map(el => {
// //   delete el.id;
// //   return el;
// // });

// Tour.create(read).then(tours => {
//   console.log(tours);
// });

Users.create(users, { validateBeforeSave: false }).then(user => {
  console.log('users added to database');
});
// Reviews.create(reviews).then(re => {
//   console.log('reviews addded to database');
// });

// Users.deleteMany().then(() => {
//   console.log('data deleted');
// });
