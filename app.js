const http = require('http');
const path = require('path');
const express = require('express');
const Session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const request = require('request');
const swig = require('swig');
const CONFIG = require('./client_secret.json');


const ClientId = CONFIG.client_id;
const ClientSecret = CONFIG.client_secret;
const RedirectionUrl = 'http://localhost:1234/oauthCallback';

const app = express();
var accessToken;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');

app.use(Session({
  secret: CONFIG.client_secret,
  resave: true,
  saveUninitialized: true,
}));


function getAuthUrl() {
  // generate a url that asks permissions for Google+ and Google Calendar scopes
  // The scope will be delimited by space.
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
  ];
  const url = `${CONFIG.host}/o/oauth2/v2/auth?scope=${scopes}&access_type=offline&include_granted_scopes=true&redirect_uri=${RedirectionUrl}&response_type=code&client_id=${CONFIG.client_id}`;
  return url;
  console.log(url);
}

app.use('/oauthCallback', function (req, res) {
  const code = req.query.code;
  const grant_type = req.query.scope;
  const option = {
    method: 'POST',
    url: `${CONFIG.api_base}/oauth2/v4/token`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    form: {
      code: code,
      client_id: CONFIG.client_id,
      client_secret: CONFIG.client_secret,
      redirect_uri: RedirectionUrl,
      grant_type: 'authorization_code',
    },
  };
  request(option, function (error, response, body) {
    if (error) {
      console.log(error);
      res.send(error);
    } else {
      accessToken = JSON.parse(body).access_token;
      res.redirect('/messages');
    }
  });
});

app.get('/messages', function (req, res) {
console.log(accessToken);
  const option = {
    method: 'GET',
    url: `${CONFIG.api_base}/gmail/v1/users/me/messages`,
     headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`,
      },
  };
request(option, function (error, response, body) {
    if (error) {
      console.log(error);
      res.send(error);
    } else {
      res.send(body);
    }
  });

});


app.get('/message/:messageid', function (req, res) {
  const msgId = req.params.messageid;
  console.log({ hi: msgId });
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(req.session.tokens);

  const gmail = google.gmail('v1');

  gmail.users.messages.get({
    id: msgId,
    userId: 'me',
    auth: oauth2Client,
  }, function (err, response) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(response);
    res.send(response);
  });
});

app.get('/thread/:threadid', function (req, res) {
  const thdId = req.params.threadid;
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(req.session.tokens);

  const gmail = google.gmail('v1');

  gmail.users.threads.get({
    id: thdId,
    userId: 'me',
    auth: oauth2Client,
  }, function (err, response) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(response);
    res.send(response);
  });
});

app.get('/result/:query', function (req, res) {
  const query = req.params.query;
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(req.session.tokens);
  const gmail = google.gmail('v1');

  gmail.users.messages.list({
    userId: 'me',
    q: `subject:${query} newer_than:31d`,
    auth: oauth2Client,
  }, function (err, response) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(response);
    res.send(response.messages);
  });
});


app.use('/', function (req, res) {
  const url = getAuthUrl();
  res.send(`
        <h1>Authentication using google oAuth</h1>
        <a href=${url}>Login</a>
    `);
});


const port = 1234;
const server = http.createServer(app);
server.listen(port);
server.on('listening', function () {
  console.log(`listening to ${port}`);
});
