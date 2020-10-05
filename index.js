const http = require('http');
const config = require('./config/database');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const hostname = '127.0.0.1';
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
var app = express();
const path = require('path');

const userRoute = require('./route/user');
const jobticketRoute = require('./route/jobticket');
const categoryRoute = require('./route/categories');

app.use(cors());
app.use(bodyParser.json({limit:'50mb'})); 
app.use(bodyParser.urlencoded({extended:true, limit:'50mb'}));

app.use('/user', userRoute);
app.use('/jobticket', jobticketRoute);
app.use('/category', categoryRoute);

app.get('/', function (req, res) {
    res.send('Successful');
});

app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => {
  console.log('Server listening on port ' + port);
});