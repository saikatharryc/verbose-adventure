const express = require('express');
const request = require('request');
const CONFIG = require('../../../config')();
const access = require('./authenticate');
const async = require('async');

const router = express.Router();

let snippetArray = [];

function fetchMessageById(msgId , callback) {
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages/${msgId}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access.accessToken}`,
      },
    };
    request(option, function (error, response, body) {
      if (error) {
        console.log(error);
        return error;
      }
      const messageBody = JSON.parse(body);
      callback(null,messageBody.snippet);
    });
  }
}


function search(req, res, next) {
  const querySub = req.query.query;
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages?q="subject: ${querySub}"&maxResults=10`,
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

          let count = 0;
  async.each(messageIds, function (data) {
    fetchMessageById(data, function (error, result) {
      if (error) {
        return error;
      }
      console.log(count);
      snippetObj = {messageId:data,snippet:result};

      snippetArray = snippetArray.concat(snippetObj);
      count++;
      // Stop and Start processing when the element of an array processed, pyshed to summary.
      if (count === messageIds.length) {
          res.render('result', {body:snippetArray});
      }
    });
  });

      // res.render(
      //   'result',
      //   { body: messageIds }
      //   );
    });
  }
}



router.get('/search', search);

module.exports = router;
