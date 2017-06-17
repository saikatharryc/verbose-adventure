const async = require('async');

const Models = require('../../app/models');

let arrayOfThreadInst;
function chromium(params, callback) {
  const threadObj = new Models.Thread({
    thread_id: params.id,
    message: params.message,
  });
  Models.Thread.findOne({ thread_id: params.id }).exec(function (threadFetchError, threads) {
    if (threadFetchError) {
      callback({ type: 'db_error', msg: 'Failed to find in all thread.', errorDetail: threadFetchError });
    }
    if (!threads) {
      console.log('creating new thread insted');
      threadObj.save(function (errInSave, SavedThread) {
        if (errInSave) {
          console.log(errInSave);
          callback(null);
        }
        console.log(SavedThread);
        callback(null);
      });
    }
    else{
      callback(null);
    }
  });
}

function saveThread(arrayOfThreadInst, callback) {
  let counts = 0;

  async.each(arrayOfThreadInst, function (threadInst, eachCallback) {
    console.log(counts);
    chromium({
      id: threadInst.threadId,
      message: threadInst.result || null,
    }, function (errorInSave, savedThreadInstance) {
      if (errorInSave) {
        eachCallback(errorInSave);
      }
      eachCallback(null);
    });
    counts++;
  }, function (error) {
    if (error) {
      callback(error);
    } else {
      callback(null, 'saved all');
    }
  });
}


module.exports = {
  saveThread: saveThread,
};
