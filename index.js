require('dotenv').config()

const process = require('process');
const fs = require("fs");
const { createWriteStream } = require('fs');
const util = require('./utilities/utilities');
const path = require('path');
const connection = require('./connectors/connection');
const message_bot  = require('./connectors/message_bot');
const callback_query_bot  = require('./connectors/callback_query_bot');
const bot = require('./services/telegramBot');
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const UsersController = require('./controllers/UserController');
const MessegesController = require('./controllers/MessegesController');
const InitializationController = require('./controllers/InitializationController');
const ManagerController = require('./controllers/ManagerController');


const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http, { maxHttpBufferSize: 1e8, pingTimeout: 60000 });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/media*', (req, res) => {
  try {
    if (fs.existsSync(path.join(__dirname, req.originalUrl))) {
      return res.status(200).sendFile(path.join(__dirname, req.originalUrl));
    }
    return res.status(202).send();
  } catch(err) {
    console.error(err);
  }
});
app.post("/register", (req, res) => {
// our register logic goes here...
});

// Login
app.post("/login", (req, res) => {
// our login logic goes here
});

http.listen(process.env.PORT, () => console.log('listening on *:' + process.env.PORT));
InitializationController.initialization();

io.on('connection', connection)

bot.on('message', message_bot);

bot.on('callback_query', callback_query_bot);
