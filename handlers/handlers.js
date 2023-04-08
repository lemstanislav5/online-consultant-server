const fs = require("fs");
const { createWriteStream } = require('fs');
const util = require('../utilities/utilities');

const UsersController = require('../controllers/UserController');
const MessegesController = require('../controllers/MessegesController');
const ManagerController = require('../controllers/ManagerController');


module.exports = {
  callback_query_bot: async msg => {
    const chatId = msg.data;
    //! При выводе сообщений пользователя обновляю данные сообщения как прочитанные
    //! MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', delivered = 1, read = 0);
    UsersController.setCurrent(chatId, 1);
  },
  connection: async (socket, io, bot) => {
    console.log('Пользователь подключился!');
     // Получаем managerId 
     const manager = await ManagerController.get();
     // Если менеджер отсуствует или не имеет доступ (не ввел пароль) отправляем уведомление
     if (manager.length === 0 || manager[0].accest === 0) {
      return io.to(socket.id).emit('notification', 'Менеджер offline!');
     }
    /* 
      Следует отпметить, что по логике отчета об отправленных сообщениях, пользователь 
      получает уведомления об: 
        - (не)успешной доставке на сервер;
        - (не)успешной отправке сообщения в бот.
      При этом пользователь не получит уведомление о прочтении сообщения. 
    */
    socket.on('newMessage', (message, callback) => {
      // Разбераем сообщение
      const { id, text, chatId } = message;
      // Опеределяем дефолтные настроки обратного уведомления  для callback
      let notification = {add: false, send: false};
      // Устаналиваем chatId текущего пользователя если он не выбран
      UsersController.setCurrent(chatId);
      // В зависимости от результата поиска добовляем или обновляем socketId
      UsersController.addOrUpdateUser(socket, chatId);
      /** 
       * Пытаемся добавить сообщение в базу данных, если происходит ошибка отправляем 
       * уведомление пользователю { add: false, send: false}, 
       * если сообщение успешно добавлено обновляем уведомление { add: true, send: false} 
      */
      try {
        MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', read = 0);
        notification = {...notification, add: true};
      } catch (err) {
        console.error('MessegesController.add: ', err);
        return callback(true, notification);
      }
      /** 
       * Пытаемся отправить сообщение в бот, если отправка успешна,
       * обновляем уведомление на { add: true, send: true}, 
       * если произошла ошибка отправляем уведомление { add: true, send: false}, 
       * и сообщаем об ошибке
      */
      try {
        MessegesController.sendMessegesToBot(bot, io, text, chatId, socket);
        notification = {...notification, send: true};
        return callback(false, notification);
      } catch (err) {;
        console.error('newMessage -> MessegesController.sendMessegesToBot: ', err);
        return callback(true, notification);
      }
    });
  
    socket.on('setNewSocket', (chatId) => {
      console.log('setNewSocket', chatId)
      // Устаналиваем chatId текущего пользователя если он не выбран
      UsersController.setCurrent(chatId);
      // В зависимости от результата поиска добовляем или обновляем socketId
      UsersController.addOrUpdateUser(socket, chatId);
    });
  
    socket.on('introduce', async (message, callback) => {
      // Разбираем сообщение
      const { name, email, chatId } = message;
      // Опеределяем дефолтные настроки обратного уведомления для callback
      let notification = {add: false, send: false}
      /**  
       * Пытаемся добавить "name" и "email" в базу данных, если происходит ошибка отправляем 
       * уведомление пользователю { add: false, send: false}, 
       * если сообщение успешно добавлено обновляем уведомление { add: true, send: false} 
      */ 
      try {
        UsersController.setNameAndEmail(name, email, chatId);
        notification = {...notification, add: true};
      } catch (err) {
        console.error('UsersController.setUserNameAndEmail: ', err);
        return callback(true, notification);
      }
      /** 
       * Пытаемся отправить сообщение в бот, если отправка успешна,
       * обновляем уведомление на { add: true, send: true}, 
       * если произошла ошибка отправляем уведомление { add: true, send: false}, 
       * и сообщаем об ошибке
      */
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
      await util.checkDirectory(dir, fs); 
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
  },
  message_bot: async (message, io, bot) => {
    let messageId = 'server_' + new Date().getTime();
    const {chat, text, photo, document, video, audio, voice} = message;
    let type = false, dir  = false, data = false;
    const { id }  = chat;
    if (text === process.env.PASSWORD) {
      ManagerController.accest(id);
      return MessegesController.sendBotNotification(bot, id, 'Доступ получен!');
    }
    let check = await ManagerController.check(id);
    if (!check) {
      ManagerController.add(id);
      return MessegesController.sendBotNotification(bot, id, 'Введите пароль:')
    };
  
    if (photo !== undefined) {
      // В массиве "photo" содержатся ссылки на изображения различного размера 
      data = await bot.getFile(photo[3].file_id); 
      type = util.ext(data.file_path);
      dir  = ('jpeg' || type === 'jpg' || type === 'png') ? '/media/images/' : false;
    }
  
    if(video !== undefined) {
      data = await bot.getFile(video.file_id);
      type = util.ext(data.file_path);
      dir  = (type === 'mp4' || type ===  'wav') ? '/media/video/' : false;
    }
  
    if(document !== undefined) {
      data = await bot.getFile(document.file_id);
      type = util.ext(document.file_name);
      dir  = (type === 'pdf' || type === 'doc' || type === 'docx' || type === 'txt') ? '/media/documents/' : false;
    }
  
    if(audio !== undefined) {
      data = await bot.getFile(audio.file_id);
      type = util.ext(audio.file_name);
      dir  = (type === 'mp3' || type === 'mpeg') ? '/media/audio/' : false;
    }
  
    if(voice !== undefined) {
      data = await bot.getFile(voice.file_id);
      type = 'ogg';
      dir  = '/media/audio/';
    }
  
    if(type && dir && data) {
      const { file_id } = data;
      if (await util.checkDirectory(__dirname + dir, fs)) {
        const stream = await bot.getFileStream(file_id);
        let fileName = new Date().getTime() + '.' + type;
        stream.pipe(createWriteStream(__dirname + dir + fileName));
        stream.on('finish', async () => {
          let currentUser = await UsersController.getCurrent();
          if (currentUser.length === 0) {
            return MessegesController.sendBotNotification(bot, id, 'Адресат вашего сообщения не выбран!');
          } else {
            const socketId = await UsersController.getSocketCurrentUser(currentUser[0].chatId);
            if (!socketId) return MessegesController.sendBotNotification(bot, id, 'Адресат не найден в базе!');
            io.to(socketId).emit('newMessage', 'http://' + URL + dir + fileName, type);
            //! Проверка доставки сообщения
            MessegesController.add(id, socketId, messageId, 'http://' + URL + dir + fileName, new Date().getTime(), 'to', read = 0);
          }
        });
      } else {
        console.log('no dir')
      }
    } else {
      if (text === '/start') {
        MessegesController.sendListMailsToBot(bot, id);
      } else {
        let currentUser = await UsersController.getCurrent();
        if (currentUser.length === 0) {
          return MessegesController.sendBotNotification(bot, id, 'Адресат вашего сообщения не выбран!');
        } else {
          const socketId = await UsersController.getSocketCurrentUser(currentUser[0].chatId);
          if (!socketId) return MessegesController.sendBotNotification(bot, id, 'Адресат не найден в базе!');
          io.to(socketId).emit('newMessage', text, type = 'message');
          //! Проверка доставки сообщения
          MessegesController.add(id, socketId, messageId, text, new Date().getTime(), 'to', read = 0);
        }
      }
    }
  }
}