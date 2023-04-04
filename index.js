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
      io = require('socket.io')(http, { maxHttpBufferSize: 1e8, pingTimeout: 60000 });

app.use(headerAccessControl);

app.get('/api', routes);
// app.post("/register", (req, res) => {
// // our register logic goes here...
// });

// // Login
// app.post("/login", (req, res) => {
// // our login logic goes here
// });

http.listen(process.env.PORT, () => console.log('listening on *:' + process.env.PORT));
InitializationController.initialization();

io.on('connection', socket => handlers.connection(socket, io, bot))

bot.on('message', message => handlers.message_bot(message, io, bot));

bot.on('callback_query', msg => handlers.callback_query_bot(msg));
