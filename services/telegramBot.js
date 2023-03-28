const {TELEGRAM_API_TOKEN} = require('../../config.js');
const TelegramBot = require('node-telegram-bot-api');
module.exports = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
