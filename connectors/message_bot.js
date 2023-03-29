module.exports = async message => {
  let messageId = 'server_' + new Date().getTime();
  const {chat, text, photo, document, video, audio, voice} = message;
  let type = false, dir  = false, data = false;
  const { id }  = chat;
  if (text === PASSWORD) {
    ManagerController.accest(id);
    return MessegesController.sendBotNotification(bot, id, 'Доступ получен!');
  }
  let check = await ManagerController.check(id);
  if (!check) {
    ManagerController.add(id);
    return MessegesController.sendBotNotification(bot, id, 'Введите пароль:')
  };
  const manager = await ManagerController.find(id);

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