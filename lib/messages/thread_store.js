const Models = require('../../app/models');


function saveThread(threadInst, callback) {

  const threadObj = new Models.Thread({
    thread_id: threadInst.messages[0].threadId,
    message: threadInst.messages[0].snippet,
    internalDate: messages[0].internalDate,
  });

threadObj.save(function (errInSave, SavedThread) {
    if (errInSave) {
      callback({ type: 'db_error', msg: 'Failed to Create a new Thread in DB.', errorDetail: errInSave });
      return errInSave;
    }
    callback(null, SavedThread);
    return SavedThread;
  });

}


module.exports = {
  saveThread: saveThread,
};
