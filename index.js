const express = require("express");
const fetch = require("node-fetch");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3000;

// Твои доступы (уже всё вшито, босс!)
const JOINUP_TOKEN = "19749d2ce6de47a3b429d9cd49a8e970";
const TELEGRAM_TOKEN = "8869775838:AAHiF01aOAvRvQjiNZ8Z-fyHmwrnZfLFGP4";

// Запуск бота в режиме автоматического прослушивания
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Домашняя страничка для Render, чтобы он не думал, что сервер умер
app.get("/", (req, res) => {
  res.send("Holiday Outlet Bot успешно запущен и готов к работе!");
});

// Оставляем старый адрес для проверки городов через браузер (прокси)
app.get("/towns", async (req, res) => {
  try {
    const url = `https://online.joinupbaltic.eu/export/default.php?samo_action=api&version=1.0&type=json&oauth_token=${JOINUP_TOKEN}&action=SearchTour_TOWNFROMS`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from JoinUp" });
  }
});

// ===== ЛОГИКА ТЕЛЕГРАМ-БОТА =====

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Привет, дорогая! Я твой послушный бот-поисковик для проекта *Holiday Outlet*. 🌴\n\n" +
    "Давай проверим связь с сервером Join UP!. Нажми на команду /test, и я попробую вытащить список городов вылета из их базы.",
    { parse_mode: "Markdown" }
  );
});

// Тестовая команда /test
bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Так, секунду, штурмую серверы Join UP! своим запросом...");

  try {
    const url = `https://online.joinupbaltic.eu/export/default.php?samo_action=api&version=1.0&type=json&oauth_token=${JOINUP_TOKEN}&action=SearchTour_TOWNFROMS`;
    const response = await fetch(url);
    const data = await response.json();

    // Извлекаем массив городов из ответа API
    const towns = data.data || data;

    if (Array.isArray(towns)) {
      // Берем первые 5 городов для теста, чтобы не спамить
      const firstFive = towns.slice(0, 5).map(t => t.name || t.name_ru || JSON.stringify(t)).join(", ");
      bot.sendMessage(
        chatId,
        `🎉 Победа! Связь налажена, база отдала данные.\n\nВот первые 5 городов вылета, которые я увидела: *${firstFive}*`,
        { parse_mode: "Markdown" }
      );
    } else {
      bot.sendMessage(
        chatId,
        `Связь есть, но ответ странный. Вот что прислали: ${JSON.stringify(data).substring(0, 150)}`
      );
    }
  } catch (err) {
    bot.sendMessage(chatId, `Черт, сервак ругается: ${err.message}`);
  }
});

// Запуск веб-сервера
app.listen(PORT, () => console.log(`Proxy and Bot running on port ${PORT}`));
