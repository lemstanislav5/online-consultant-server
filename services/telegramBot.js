const process = require('process');s
const TelegramBot = require('node-telegram-bot-api');
module.exports = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {polling: true});
