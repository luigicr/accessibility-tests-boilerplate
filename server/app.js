const express = require('express');
const open = require('open');
const port = 3000;
const app = express();


app.use(express.static('src'));


app.get('/', function (req, res, next) {
  var fileName = 'index.html',
    options = {
      root: __dirname + '../src/',
      dotfiles: 'deny',
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    };

  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

app.listen(3000, function (err) {
  if (err) {
      console.log(err);
    } else {
      console.log('Example app listening on port 3000!');
      open('http://localhost:' + port);
    }
});
