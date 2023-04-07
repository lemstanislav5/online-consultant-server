const { addMessage, getIdManager, findUser, getAllUsers, getMesseges } = require('../services/dataBaseSqlite3');

class MessegesController {
  async add(chatId, socketId, messageId, text, time, type, read) {
    await addMessage(chatId, socketId, messageId, text, time, type, read);
    console.log('Сообщение добавлено в базу.');
  }
  async sendMessegesToBot(bot, text, chatId, managerId) {
    const userData = await findUser(chatId);
    const userName = (userData[0].name === null)? 'user['+userData[0].id+']' : userData[0].name + '['+userData[0].id+']';
    return bot.sendMessage(managerId, userName + '\n' + text);
  }

  async sendFile(bot, pathFile, section, managerId) {
    if (section === 'images') {
      return bot.sendPhoto(managerId, pathFile)
    } else if (section === 'documents') {
      return bot.sendDocument(managerId, pathFile);
    } else if (section === 'audio') {
      return bot.sendAudio(managerId, pathFile);
    } else if (section === 'video') {
      return bot.sendVideo(managerId, pathFile);
    } else {
      throw new Error('Неизвестный формат файла!');
    }
  }

  sendBotNotification(bot, managerId, text){
    bot.sendMessage(managerId, text);
  }

  async sendListMailsToBot(bot, id, manager){
    //! Желательно переделать на запрос к базе данных
    const users = await getAllUsers();
    if(users.length === 0) return bot.sendMessage(id, 'Посетителей нет!');
    const messages = await getMesseges();
    const arr = users.map(current => {
      let name = (current.name === null)? 'User['+current.id+']' : current.name + '['+current.id+']';
      let status = (current.online === 0)? 'offline' : 'online';
      let userMesseges = messages.reduce((result, message) => {
        if(message.chatId === current.chatId) return [...result, message];
        return result;
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
