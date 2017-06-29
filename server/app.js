const express = require('express');
const open = require('open');
const path = require('path');
const port = 3000;
const app = express();

app.use(express.static(path.join(__dirname, '../dist')));
app.use('/dist/css', express.static(path.join(__dirname, '../dist/css')));
app.use('/dist/js', express.static(path.join(__dirname, '../dist/js')));

app.get('/', function (req, res, next) {
  var fileName = 'index.html',
    options = {
      root: __dirname + '../dist/',
      dotfiles: 'allow',
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

app.listen(port, function (err) {
  if (err) {
      console.log(err);
    } else {
      console.log('Example app listening on port ' + port + '!');
      open('http://localhost:' + port);
    }
});
