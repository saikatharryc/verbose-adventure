const async = require('async');

const Models = require('../../app/models');

let arrayOfThreadInst;
function chromium(params, callback) {
  console.log({ 'sameOnme': params.count });

  const threadObj = new Models.Thread({
    thread_id: params.threadId,
    message: params.snippet,
    internalDate: params.internalDate,
  });
  Models.Thread.findOne({ thread_id: params.id }).exec(function (threadFetchError, threads) {
    if (threadFetchError) {
      // callback({ type: 'db_error', msg: 'Failed to find in all thread.', errorDetail: threadFetchError });
      res.send(threadFetchError);
    }
    if (!threads) {
      console.log({ 'counting': count });
      count++;
      console.log('creating new thread insted');
      threadObj.save(function (errInSave, SavedThread) {
        if (errInSave) {
          console.log(`exists${params.count}`);
        }
        console.log(`saved${params.count}`);
      });
    }

    if (params.count === params.length) {
      callback(null, 'saved');
    }
  });
}

function saveThread(arrayOfThreadInst, callback) {
  count = 0;

  async.each(arrayOfThreadInst, function (threadInst) {
    chromium({
      id: threadInst.messages[0].threadId,
      message: threadInst.messages[0].snippet,
      internalDate: threadInst.messages[0].internalDate,
      count: count,
      length: arrayOfThreadInst.length,
    }, function (errorInSave, savedThreadInstance) {
      if (errorInSave) {
        callback(null, errorInSave);
      }
      callback(null, 'saved all');
    });
    count++;
  });
}


module.exports = {
  saveThread: saveThread,
};
