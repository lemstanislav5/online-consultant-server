module.exports = {
  setMyCommands: (arr) => bot.setMyCommands(arr),
  on: (section, callback) => bot.on(section, callback),
  sendPhoto: (managerId, pathFile) => bot.sendPhoto(managerId, pathFile)
    .then(res => (true))
    .catch(err => {
      console.log(err);
      return false;
    }),
  sendDocument: (managerId, pathFile) => bot.sendDocument(managerId, pathFile)
    .then(res => (true))
    .catch(err => {
      console.log(err);
      return false;
    }),
  sendAudio: (managerId, pathFile) => bot.sendAudio(managerId, pathFile)
    .then(res => (true))
    .catch(err => {
      console.log(err);
      return false;
    }),
  sendVideo: (managerId, pathFile) => {
    try{
      bot.sendPhoto(managerId, pathFile);
    } catch(err) {
      console.log(err);
    }
  },
}