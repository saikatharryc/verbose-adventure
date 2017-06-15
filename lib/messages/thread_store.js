const Models = require('../../app/models');


function saveThread(threadInst, callback) {
  console.log(threadInst);
  const threadObj = new Models.Thread({
    thread_id: threadInst.messages[0].threadId,
    message: threadInst.messages[0].snippet,
    internalDate: threadInst.messages[0].internalDate,
  });
console.log(threadObj);
  Models.Thread.findOne({ thread_id: threadInst.messages[0].threadId }).exec(function (threadFetchError, threadFound) {
    if (threadFetchError) {
      callback({ type: 'db_error', msg: 'Failed to find thread with the given id.', errorDetail: threadFetchError });
      return threadFetchError;
    }
    if (threadFound) {
      callback({ type: 'Found', msg: 'Thread Found ! will not be updated again' });
    } else {
      console.log('creating new thread');
      threadObj.save(function (errInSave, SavedThread) {
        if (errInSave) {
          callback({ type: 'db_error', msg: 'Failed to Create a new Thread in DB.', errorDetail: errInSave });
          return errInSave;
        }
        callback(null, SavedThread);
        return SavedThread;
      });
    }
  });
}


module.exports = {
  saveThread: saveThread,
};
