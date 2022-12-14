var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const moment = require('moment-timezone');
logger.token('localTime', (req, res, tz) => {
  return moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('DD-MM-yyyy HH:mm:ss');
})
require('./plugins/database-init.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('[:localTime] :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms :user-agent'));
app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

app.use('/', require('./routes/index'));
app.use('/event', require('./routes/event'));
app.use('/guest', require('./routes/guest'));
app.use('/checkin', require('./routes/checkin'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send(404);
  // next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
