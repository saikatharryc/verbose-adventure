const express = require('express');
const request = require('request');
const CONFIG = require('../../../config')();
const access = require('./authenticate');

const router = express.Router();


function search(req, res, next) {
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {

    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages?q="subject: eclerx"&maxResults=10`,
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
      res.send(body);
    });
  }
}






router.get('/search', search);

module.exports = router;
