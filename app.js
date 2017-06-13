const http = require('http');
const express = require('express');
const Session = require('express-session');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const CONFIG = require('./client_secret.json');

const plus = google.plus('v1');
//const OAuth2 = google.auth.OAuth2;
const ClientId = CONFIG.client_id;
const ClientSecret = CONFIG.client_secret;
const RedirectionUrl = 'http://localhost:1234/oauthCallback';

const app = express();
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
            <a href="/details">Go to details page<;/a>
        `);
    } else {
      res.send(`
            <h3>Login failed!!</h3>
        `);
    }
  });
});

app.use('/details', function (req, res) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(req.session.tokens);

  const gmail = google.gmail('v1');
  gmail.users.messages.list({
    userId: 'me',
    q: 'newer_than:31d',
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
