import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Подключаем токены через переменные окружения
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Список стилей песен
const styles = ["диско", "итало-диско", "шансон", "романс", "баллада"];

// Команда /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Привет! Я могу создавать песни и поздравления 🎵
Выбери команду:
/song - создать песню
/greeting - написать поздравление`);
});

// Команда /song
bot.onText(/\/song/, (msg) => {
  bot.sendMessage(msg.chat.id, "Выбери стиль песни:", {
    reply_markup: {
      inline_keyboard: styles.map(style => [{ text: style, callback_data: `song_${style}` }])
    }
  });
});

// Команда /greeting
bot.onText(/\/greeting/, (msg) => {
  bot.sendMessage(msg.chat.id, "Напиши имя человека и повод для поздравления:");
});

// Обработка нажатий кнопок
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith("song_")) {
    const style = data.replace("song_", "");
    bot.sendMessage(chatId, `Создаю песню в стиле ${style}...`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Напиши текст песни в стиле ${style}` }]
    });

    bot.sendMessage(chatId, response.choices[0].message.content);
  }
});

// Обработка текста для поздравления
bot.on('message', async (msg) => {
  if (msg.text.startsWith('/') || msg.text.startsWith('song_')) return;

  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Создаю поздравление...`);

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: `Напиши красивое поздравление для: ${msg.text}` }]
  });

  bot.sendMessage(chatId, response.choices[0].message.content);
});
