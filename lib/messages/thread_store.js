const async = require('async');

const Models = require('../../app/models');

let arrayOfThreadInst;
function chromium(params, callback) {
  console.log({ 'sameOnme': params.count });

  const threadObj = new Models.Thread({
    thread_id: params.threadId,
    message: params.snippet,
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
  let counts = 0;

  async.each(arrayOfThreadInst, function (threadInst) {
    console.log(counts);
    chromium({
      id: threadInst.threadId,
      message: threadInst.result
      count: counts,
      length: arrayOfThreadInst.length,
    }, function (errorInSave, savedThreadInstance) {
      if (errorInSave) {
        callback(null, errorInSave);
      }
      callback(null, 'saved all');
    });
    counts++;
  });
}


module.exports = {
  saveThread: saveThread,
};
