module.exports = async msg => {
  const chatId = msg.data;
  //! При выводе сообщений пользователя обновляю данные сообщения как прочитанные
  //! MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', delivered = 1, read = 0);
  UsersController.setCurrent(chatId, 1);
}