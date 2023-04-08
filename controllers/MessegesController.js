const { addMessage, getIdManager, findUser, getAllUsers, getMesseges } = require('../services/dataBaseSqlite3');

class MessegesController {
  async add(chatId, socketId, messageId, text, time, type, read) {
    await addMessage(chatId, socketId, messageId, text, time, type, read);
    console.log('Сообщение добавлено в базу.');
  }
  async sendMessegesToBot(bot, io, text, chatId, socket) {
    const manager = await getIdManager();
    if (manager.length === 0) return io.to(socket.id).emit('notification', 'Менеджер offline!');
    const userData = await findUser(chatId);
    const userName = (userData[0].name === null)? 'user['+userData[0].id+']' : userData[0].name + '['+userData[0].id+']';
    if (manager.length !== 0) {
      bot.sendMessage(manager[0].managerId, userName + '\n' + text);
      console.log('Отправлено в бот.');
      // Статус сообщение устанавливается как отправленное
      // Клиенту сообщается об отправке сообщения
    } else {
      io.to(socket.id).emit('notification', 'Менеджер offline!');
      console.log('Пользователю сообщил, что менеджера нет в сети.');
    }
  }

  async sendFile(bot, io, pathFile, section, callback, socket) {
    const manager = await getIdManager();
    if (manager.length === 0) return io.to(socket.id).emit('notification', 'Менеджер offline!');
    let send;
    if (section === 'images') {
       send = bot.sendPhoto(manager[0].managerId, pathFile)
    } else if (section === 'documents') {
      send = bot.sendDocument(manager[0].managerId, pathFile);
    } else if (section === 'audio') {
      send = bot.sendAudio(manager[0].managerId, pathFile);
    } else if (section === 'video') {
      send = bot.sendVideo(manager[0].managerId, pathFile);
    }
    send.then((data) => {
      if(data.from.is_bot) callback({ url: pathFile });
    })
    .catch((err) => {
      console.log('sendPhoto err: ', err);
      callback({ url: false });
    });
  }

  sendBotNotification(bot, managerId, text){
    bot.sendMessage(managerId, text);
  }

  async sendListMailsToBot(bot, id){
    //! Желательно переделать на запрос к базе данных
    const users = await getAllUsers();
    if(users.length === 0) return bot.sendMessage(id, 'Посетителей нет!');
    const messages = await getMesseges();
    const arr = users.map(current => {
      let name = (current.name === null)? 'User['+current.id+']' : current.name + '['+current.id+']';
      let status = (current.online === 0)? 'offline' : 'online';
      let userMesseges = messages.reduce((result, message) => {
        if(message.chatId === current.chatId){
          return [...result, message];
        } else {
          return result;
        }
      }, []);
      let countMesseges = (userMesseges === undefined) ? 0 : userMesseges.length;
      return [{ text: name + ' ' + status + ': ' + countMesseges, callback_data: current.chatId }];
    })
    const sections = {
      reply_markup: JSON.stringify({ inline_keyboard: arr })
    }
    bot.sendMessage(id, 'Список посетителей: ', sections);
  }
}

module.exports = new MessegesController();
