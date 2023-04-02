const fs = require("fs");
const util = require('../utilities/utilities');

const UsersController = require('../controllers/UserController');
const MessegesController = require('../controllers/MessegesController');
const ManagerController = require('../controllers/ManagerController');

module.exports = socket => {
  console.log('Пользователь подключился!');

  socket.on('newMessage', async (message, callback) => {
    let notification = {add: false, send: false}
    const { id, text, chatId } = message;
    // Устаналиваем chatId текущего пользователя если он не выбран
    UsersController.setCurrent(chatId);
    // В зависимости от результата поиска добовляем или обновляем socketId
    UsersController.addOrUpdateUser(socket, chatId);
    //! Если добавление успещшно message: { add: true, send: false}
    try {
      MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', read = 0);
      notification = {...notification, add: true};
    } catch (err) {
      console.error('MessegesController.add: ', err);
      return callback(true, notification);
    }

    const manager = await ManagerController.get(id);
    // Сообщаем пользователю об отсутствии менеджера
    if (manager.length === 0 || manager[0].accest === 0)
      return io.to(socket.id).emit('notification', 'Менеджер offline!');
    //! Если отправка успещшна message: { add: true, send: true}
    try {
      MessegesController.sendMessegesToBot(bot, io, text, chatId, socket);
      notification = {...notification, send: true};
      return callback(false, notification);
    } catch (err) {
      console.error('newMessage -> MessegesController.sendMessegesToBot: ', err);
      return callback(true, notification);
    }
  });

  socket.on('setNewSocket', (chatId) => {
    // Устаналиваем chatId текущего пользователя если он не выбран
    UsersController.setCurrent(chatId);
    // В зависимости от результата поиска добовляем или обновляем socketId
    UsersController.addOrUpdateUser(socket, chatId);
  });

  socket.on('introduce', async (message, callback) => {
    const { name, email, chatId } = message;
    let notification = {add: false, send: false}
    try {
      UsersController.setNameAndEmail(name, email, chatId);
      notification = {...notification, add: true};
    } catch (err) {
      console.error('UsersController.setUserNameAndEmail: ', err);
      return callback(true, notification);
    }
    try {
      MessegesController.sendMessegesToBot(bot, io, `Пользователь представился как: ${name} ${email}`, chatId, socket);
      notification = {...notification, send: true};
      return callback(false, notification);
    } catch (err) {
      console.error('introduce -> MessegesController.sendMessegesToBot: ', err);
      return callback(true, notification);
    }
  });

  socket.on("upload", async (file, type, callback) => {
    let section;
    if (type === 'jpeg' || type === 'jpg' || type === 'png') {
      section = 'images';
    } else if (type === 'pdf' || type === 'doc' || type === 'docx' || type === 'txt') {
      section =  'documents';
    } else if (type === 'mp3') {
      section = 'audio';
    } else if (type === 'mp4') {
      section = 'video';
    }
    let dir = __dirname + '/media/' + section;
    await util.checkDirectory(dir, fs); //await
    const fileName = new Date().getTime();
    const pathFile = 'http://' + URL + '/api/media/' + section + '/' + fileName + '.' + type;
    console.log(pathFile);
    fs.writeFile(dir + '/' + fileName + '.' + type, file, (err) => {
      if (err) {
        callback({url: false});
        console.log(err);
      }
      MessegesController.sendFile(bot, io, pathFile, section, callback, socket);
    });
  });

  socket.on('disconnect', () => {
    UsersController.delCurrent();
    console.log('Пользователь отсоединился!')
  });
}