const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const swig = require('swig');
const routes = require('./app/controllers');
const db_connect = require('./lib/db_connect')();
const  access = require('./app/controllers/auth/authenticate');

const app = express();

/*******************************************************
    MIDDLEWARES
********************************************************/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*******************************************************
    VIEW ENGINE & PATH
********************************************************/
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');


/*******************************************************
    BASE API ENDPOINT
********************************************************/

app.use('/api/v1', routes);

/**
 * `/` Throw The Landing Page [Index.html]
 */
app.use('/', function (req, res, next) {
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  }else{
  res.render('index');
}
});



/*******************************************************
    ERROR HANDLER FOR REQUESTS
********************************************************/


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
  });
});


module.exports = app;
