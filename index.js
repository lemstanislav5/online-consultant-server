/** ЗАДАЧИ
 * Показать пользоватеей online
 * Показать всех пользователей для выбора сообщений
 * Проверка прочтения сообщения
 * const { v4: uuidv4 } = require('uuid');
 * uuidv4();
*/
//! При выводе сообщений пользователя обновляю данные сообщения как прочитанные
//! MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', delivered = 1, read = 0);
//! Проверка доставки сообщения
require('dotenv').config()

const process = require('process');
const handlers = require('./handlers/handlers');
const bot = require('./services/telegramBot');
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const routes = require('./routes/index');
const headerAccessControl = require('./middleware/headerAccessControl');
const InitializationController = require('./controllers/InitializationController');

const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http, { 
         maxHttpBufferSize: 1e8, 
         pingTimeout: 60000, 
         cors: { origin: '*' }, 
      });
/* задает разрешение на получение статических данных (изображений, аудио, видео не) 
   без привязки к url сайта с которого пошел запрос 
*/
app.use(headerAccessControl);
app.use('/api', routes);

http.listen(process.env.PORT, () => console.log('listening on *:' + process.env.PORT));
InitializationController.initialization();

// группа связи телеграмм и сокета, я их называю "коннекторы"
io.use((socket, next) => handlers.getManagerId(socket, next));
io.on('connection', socket => handlers.connection(socket, bot));

bot.on('message', message => handlers.message_bot(message, io, bot));
bot.on('callback_query', msg => handlers.callback_query_bot(msg));