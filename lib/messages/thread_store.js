const Models = require('../../app/models');


function saveThread(threadInst, callback) {
  const threadObj = new Models.Thread({
    thread_id: threadInst.messages[0].threadId,
    message: threadInst.messages[0].snippet,
    internalDate: threadInst.messages[0].internalDate,
  });


  console.log(`creating new thread ${threadInst.messages[0].threadId}`);
  threadObj.save(function (errInSave, SavedThread) {
    if (errInSave) {
      callback('exist', null);
    }
    callback(null, SavedThread);
    return SavedThread;
  });
}


module.exports = {
  saveThread: saveThread,
};
