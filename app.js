const http = require('http');
const path = require('path');
const express = require('express');
const Session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const swig = require('swig');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const CONFIG = require('./client_secret.json');

const plus = google.plus('v1');

const ClientId = CONFIG.client_id;
const ClientSecret = CONFIG.client_secret;
const RedirectionUrl = 'http://localhost:1234/oauthCallback';

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');

app.use(Session({
  secret: CONFIG.client_secret,
  resave: true,
  saveUninitialized: true,
}));

function getOAuthClient() {
  const auth = new googleAuth();
  return new auth.OAuth2(ClientId, ClientSecret, RedirectionUrl);
}

function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  // generate a url that asks permissions for Google+ and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/gmail.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes, // If you only need one scope you can pass it as string
  });

  return url;
}

app.use('/oauthCallback', function (req, res) {
  const oauth2Client = getOAuthClient();
  const session = req.session;
  const code = req.query.code;
  oauth2Client.getToken(code, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      oauth2Client.setCredentials(tokens);
      session.tokens = tokens;
      res.send(`
            <h3>Login successful!!</h3>
            <a href="/message">See message IDs from last month</a>
        `);
    } else {
      res.send(`
            <h3>Login failed!!</h3>
        `);
    }
  });
});

app.get('/messages/:token', function (req, res) {
  const token = req.params.token || 0;
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(req.session.tokens);

  const gmail = google.gmail('v1');

  gmail.users.messages.list({
    userId: 'me',
    q: 'newer_than:31d',
    auth: oauth2Client,
    pageToken: token,
  }, function (err, response) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(response);
    res.send(response);
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
