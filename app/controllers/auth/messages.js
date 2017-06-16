const express = require('express');
const request = require('request');
const CONFIG = require('../../../config')();
const access = require('./authenticate');
const threadLib = require('../../../lib/messages/thread_store');
const async = require('async');

const router = express.Router();
let threadIds;
let store;


function messages(req, res, next) {
  console.log(access.accessToken);
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages?q="in: newer_than:31d"&maxResults=300`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access.accessToken}`,
      },
    };
    request(option, function (error, response, body) {
      if (error) {
        console.log(error);
        res.send(error);
      } else if (JSON.parse(body).nextPageToken){
        store = JSON.parse(body).messages;
        nextPageSystem(JSON.parse(body).nextPageToken);
      }
      else{
        const messages = JSON.parse(body).messages;
        //threadIds = messages.map(function (a) { return a.threadId; });

        //console.log(threadIds.length);
        res.send(messages);
      }
    });
  }


function nextPageSystem(nextPageToken) {
  const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages?q="in: newer_than:350d"&maxResults=300&pageToken=`+nextPageToken,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access.accessToken}`,
      },
    };


    request(option, function (error, response, body) {
    if (error) {
      console.log(error);
    } else if (JSON.parse(body).nextPageToken){
        store = store.concat(JSON.parse(body).messages);
        nextPageSystem(JSON.parse(body).nextPageToken);
      }else {
        //res.send(body);
      store = store.concat(JSON.parse(body).messages);
      console.log({count: store.length})
    res.send(store);
    }
  });

}


}


function threadById(thrdId) {
  const option = {
    method: 'GET',
    url: `${CONFIG.api_base}/gmail/v1/users/me/threads/${thrdId}?format=minimal`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${access.accessToken}`,
    },
  };
  request(option, function (error, response, body) {
    if (error) {
      console.log(error);
    } else {
      const thread = JSON.parse(body);
      threadLib.saveThread(thread, function (errorInSave, savedThreadInstance) {
        if (errorInSave) {
          console.log(errorInSave);
        }
        console.log(`${thrdId} saved`);
      });
    }
  });
}


function babelThreads(req, res, next) {
 var count = 0
  async.forEach(threadIds, function (elementOfArray, callback) {
    console.log(elementOfArray+' '+ count);
    threadById(elementOfArray);
    count++
    callback()
  }, function (err) {
    if (err) { throw err; }
    console.log('processing all elements completed');
  });
}

router.get('/messages', messages);
router.get('/thread', babelThreads);

module.exports = router;
