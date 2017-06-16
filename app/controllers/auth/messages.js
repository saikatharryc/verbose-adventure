const express = require('express');
const request = require('request');
const CONFIG = require('../../../config')();
const access = require('./authenticate');
const threadLib = require('../../../lib/messages/thread_store');
const async = require('async');
const atob = require('atob');

const router = express.Router();
let threadIds;
let store;
const samary = [];

/**
 * Fetch Message By Id
 *
 * @param      {Object}    req     The request
 * @param      {Object}    res     The resource
 * @param      {Function}  next    The next
 */
function messageById(req, res, next) {
  const queryIdreq = req.params.id;
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages/${queryIdreq}`,
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
      //res.send(body);
      body = JSON.parse(body);
      function decode(string) {
        return decodeURIComponent(escape(atob(string.replace(/\-/g, '+').replace(/\_/g, '/'))));
      }
      function getText(body) {
        let result = '';
  // In e.g. a plain text message, the payload is the only part.
        let parts = [body.payload];

        while (parts.length) {
          const part = parts.shift();
          if (part.parts) {
            parts = parts.concat(part.parts);
          }
          if (part.mimeType === 'text/plain') {
      // Continue to look for a 'text/html' part.
            result = decode(part.body.data);
          } else if (part.mimeType === 'text/html') {
      // 'text/html' part found. No need to continue.
            result = decode(part.body.data);
            break;
          }
        }
        return result;
      }
      const text = getText(body);
      res.send(text);
    });
  }
}

/**
 * List all the threadIds
 *
 */
function messages() {
  //console.log(access.accessToken);
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
      } else if (JSON.parse(body).nextPageToken) {
        store = JSON.parse(body).messages;
        //pass to the nextPageSystem() again if nextPageToken is available
        nextPageSystem(JSON.parse(body).nextPageToken);
      } else {
        const messages = JSON.parse(body).messages;
        threadIds = messages.map(function (a) { return a.threadId; });

        //console.log(threadIds.length);
        return threadIds;
      }
    });
  }

/**
 * Takes nextPageToken as input ,process and concats the result with the previous.
 *
 * @param      {string}  nextPageToken  The next page token
 */
  function nextPageSystem(nextPageToken) {
    const option = {
      method: 'GET',
      url: `${CONFIG.api_base}/gmail/v1/users/me/messages?q="in: newer_than:31d"&maxResults=300&pageToken=${nextPageToken}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${access.accessToken}`,
      },
    };


    request(option, function (error, response, body) {
      if (error) {
        console.log(error);
      } else if (JSON.parse(body).nextPageToken) {
        store = store.concat(JSON.parse(body).messages);
        nextPageSystem(JSON.parse(body).nextPageToken);
      } else {
        store = store.concat(JSON.parse(body).messages);
        console.log({ count: store.length });
        threadIds = store.map(function (a) { return a.threadId; });
        return threadIds;
      }
    });
  }
}

/**
 * Get thread Details By ID
 *
 * @param      {ObjectId}    thrdId    The thrd identifier
 * @param      {Function}  callback  The callback
 */
function threadById(thrdId, callback) {
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
      callback(null, thread);
    }
  });
}

/**
 * Helps to save into DB , Foreach item in array
 *
 * @param      {object}    req     The request
 * @param      {object}    res     The resource
 * @param      {Function}  next    The next
 */
function babelThreads(req, res, next) {
  if (!access.accessToken) {
    res.redirect('/api/v1/auth/oauth2/login');
  } else if (!threadIds) {
    messages();
  }
  let count = 0;
  async.each(threadIds, function (data) {
    threadById(data, function (error, result) {
      if (error) {
        return error;
      }
      console.log(count);
      //Concates result and makes an array of all the objects to be saved
      samary.push(result);
      count++;
      // Stop and Start processing when the element of an array processed, pyshed to summary.
      if (count === threadIds.length) {
        threadLib.saveThread(samary, function (errorInSave, savedThreadInstance) {
          if (errorInSave) {
            res.send(errorInSave);
          }
          res.send('all data saved');
        });
      }
    });
  });
}

router.get('/message/:id', messageById);
router.get('/messages', messages);
router.get('/thread', babelThreads);

module.exports = router;
