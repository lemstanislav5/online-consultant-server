const process = require('process');
console.log(process.env.TELEGRAM_API_TOKEN)
const TelegramBot = require('node-telegram-bot-api');
module.exports = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {polling: true});
