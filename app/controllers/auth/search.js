const express = require('express');
const request = require('request');
const CONFIG = require('../../../config')();
const access = require('./authenticate');
const async = require('async');

const router = express.Router();

let snippetArray = [];

/**
 * Fetches a message by identifier.
 *
 * @param      {String}    msgId     The message identifier
 * @param      {Function}  callback  The callback
 */
function fetchMessageById(msgId, callback) {
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
    callback(null, messageBody.snippet);
    return messageBody.snippet;
  });
}

/**
 * Searches for the first match.
 *
 * @param      {object}    req     The request
 * @param      {object}    res     The resource
 * @param      {Function}  next    The next
 */
function search(req, res, next) {
  const querySub = req.query.query;
  const maxResults = 10;

  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages?q="subject: ${querySub}"&maxResults=${maxResults}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access.accessToken}`,
      },
    };
    request(option, function (error, response, body) {
      if (error) {
        console.log(error);
        res.send(error);
      }else if(!JSON.parse(body).messages){
        res.json({type:'not_found',info:'Keyword Doesnot match any message!'})
      }else{
      const messageBody = JSON.parse(body).messages;
      const messageIds = messageBody.map(function (a) {
        return a.id;
      });

      let count = 0;
      async.each(messageIds, function (data) {
        fetchMessageById(data, function (error, result) {
          if (error) {
            return error;
          }
          console.log(count);
          //Craft the object with the snippet & message ID .
          const snippetObj = { messageId: data, snippet: result };
          //Create the full set of ARray of objects, that contins the first 10 search result.
          snippetArray = snippetArray.concat(snippetObj);
          count += 1;
          // Stop and Start processing when the element of an array processed.
          if (count === messageIds.length) {
            res.render('result', { body: snippetArray });
          }
        });
      });
    }
    });

  }
}


router.get('/search', search);

module.exports = router;
