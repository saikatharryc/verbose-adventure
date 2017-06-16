const express = require('express');
const request = require('request');
const CONFIG = require('../../../config')();
const access = require('./authenticate');

const router = express.Router();


function search(req, res, next) {
  const querySub = req.params.query;
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages?q="subject: "&maxResults=10`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access.accessToken}`,
      },
    };
    request(option, function (error, response, body) {
      if (error) {
        console.log(error);
        res.send(error);
      }
      const messageBody = JSON.parse(body).messages;
      messageIds = messageBody.map(function (a) { return a.id; });
      res.render(
        'result',
        {body : messageIds }
        );
    });
  }
}


router.get('/search/:query', search);

module.exports = router;
