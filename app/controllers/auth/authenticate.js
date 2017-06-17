
const express = require('express');
const request = require('request');
const CONFIG = require('../../../config')();
const router = express.Router();

/**
 * Gets the auth url.
 *
 * @param      {object}    req     The request
 * @param      {object}    res     The resource
 * @param      {Function}  next    The next
 */
function getAuthUrl(req, res, next) {
  // generate a url that asks permissions for Google+ and Google Calendar scopes
  // The scope will be delimited by space.
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly'
  ];
  const url = `${CONFIG.host}/o/oauth2/v2/auth?scope=${scopes}&access_type=offline&include_granted_scopes=true&redirect_uri=${CONFIG.redirect_uris[1]}&response_type=code&client_id=${CONFIG.client_id}`;
  console.log(url);
  res.render('login',{url});
}

/**
 * Google Login Callback Handler
 *
 * @param      {Object}    req     The request
 * @param      {Object}    res     The resource
 * @param      {Function}  next    The next
 */
function catchBack(req, res, next) {
  const code = req.query.code;
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
      redirect_uri: CONFIG.redirect_uris[1],
      grant_type: 'authorization_code',
    },
  };
  request(option, function (error, response, body) {
    if (error) {
      console.log(error);
      res.send(error);
    } else {
      module.exports.accessToken = JSON.parse(body).access_token; //making the variable accessible to globally
      res.redirect('/');
    }
  });
}



router.get('/login', getAuthUrl);
router.get('/callback', catchBack);

module.exports = router;
