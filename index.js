import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import SmartProxy from "zyte-smartproxy-puppeteer";
import TelegramBot from "node-telegram-bot-api";
import UserAgent from "user-agents";
import DotEnv from "dotenv";

DotEnv.config();

const userChatsIds = process.env.USER_IDS.split(',');
const token = "5984074696:AAFyaVkWe-D03-W6LRbkChV6YdeivY73f7U";
const bot = new TelegramBot(token, { polling: true });

puppeteer.use(StealthPlugin());
puppeteer.use(SmartProxy); // optional but need a paid account
const event = process.env.EVENT_URL.split("/");

const getAlerts = async () => {
    const browser = await puppeteer.launch({
        headless: true,
      // executablePath: "/usr/bin/chromium",
        timeout: 3000,
        args: [
            "--disable-web-security",
            // if you want to work with proxies
            '--incognito',
            '--no-sandbox',
            '--disable-setuid-sandbox'
            // '--proxy-server=127.0.0.1:9876'
        ],
    });

    let page = await browser.newPage();
    await page.setUserAgent(UserAgent.random().toString())
    await page.setJavaScriptEnabled(true);
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    let pages = await browser.pages();
    const oldPage = pages[0];
    await oldPage.close();

    await page.goto(process.env.EVENT_URL, {
        waitUntil: "domcontentloaded",
    });
    await page.waitForNetworkIdle();
    console.log("vamos")
    while (true) {
        let html = await page.content();

        console.log(html);

        var listSectionButton = await page.$("aside button:nth-child(2)");
        if (!listSectionButton && !html.includes("Buscar entradas")) {
            console.log("No se ha encontrado el botón ni el texto Buscar entradas.");
            await noTicketsAvailables();
            return false;
        }

        if (listSectionButton) {
            await listSectionButton.click();
        }

        var selectionLists = await page.$$("main#main-content ul");
        if (selectionLists.length !== 2) {
            console.log("Lists found: " + selectionLists.length);

            await noTicketsAvailables();
        } else {
            ticketsAvailables();
        }


        console.log("Page is now refreshing");
        let milliseconds = process.env.SECONDS * 1000;
        sleep(milliseconds);
        await page.reload();
    }


};

async function ticketsAvailables() {
    for (let index = 0; index < userChatsIds.length; index++) {
        var userChatId = userChatsIds[index];
        await bot.sendMessage(
            userChatId,
            "ALERT: Resale for " + event.at(4) + " available here: " + process.env.EVENT_URL
        );
    }
    console.log("SMS sent successfully! 🌟");
}
async function noTicketsAvailables() {
    console.log("No tickets avaialbles");
    for (let index = 0; index < userChatsIds.length; index++) {
        var userChatId = userChatsIds[index];
        await bot.sendMessage(userChatId, "No hay tickets disponibles para el evento " + event.at(4));
    }
}
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

// Start the scraping
getAlerts().then((r) => {
    if (r) {
        console.log("sending alerts");
    }
});
