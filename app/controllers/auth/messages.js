const express = require('express');
const request = require('request');
const CONFIG = require('../../../config')();
const access = require('./authenticate');
const router = express.Router();

function messages(req, res, next) {
  console.log(access.accessToken);
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages?q="in: newer_than:31d"&maxResults=1000`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access.accessToken}`,
      },
    };
    request(option, function (error, response, body) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        const messages = JSON.parse(body).messages;
        const threadIds = messages.map(function (a) { return a.threadId; });

        console.log(messages.length);
        res.send(threadIds);
      }
    });
  }
}

function threadById(req, res, next) {
  thrdId = req.params.id;
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/threads/${thrdId}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access.accessToken}`,
      },
    };
    request(option, function (error, response, body) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        const thread = JSON.parse(body);

        res.send(thread);
      }
    });
  }
}

router.get('/messages', messages);
router.get('/thread/:id', threadById);

module.exports = router;
