const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: '../../config.env' });
const Tour = require('../../models/toursmodels');
require(`${__dirname}/../../dbConnection`);

let read = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));

// read = read.map(el => {
//   delete el.id;
//   return el;
// });

Tour.create(read).then(tours => {
  console.log(tours);
});
