import {send_to_openai} from './openai.mjs'
import {WechatyBuilder} from "wechaty";
import QRCode from "qrcode";

const bot = WechatyBuilder.build({
    name: "wechat-assistant",
    puppetOptions: {
        uos: true,
    },
    puppet: "wechaty-puppet-wechat",
});
// get a Wechaty instance

const starttime = Date.now();
async function main() {
    bot
        .on("scan", async (qrcode, status) => {
            const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
            console.log(`Scan QR Code to login: ${status}\n${url}`);
            console.log(
                await QRCode.toString(qrcode, {type: "terminal", small: true})
            );
        })
        .on("login", async (user) => {
            console.log(`User ${user} logged in`);
        })
        .on("message", async (message) => {
            console.log(message.text())
            if (Date.now() - starttime < 1000 * 10) { // 启动10秒后才开始回复
                return;
            }
            if (message.self()) {
                return;
            }
            if (message.text().startsWith("/ping")) {
                await message.say("pong");
                return;
            }
            if (message.text().startsWith("@BOOM🕶 ")) {
                try {
                    const req = message.text().replace("@BOOM🕶 ", "")
                    console.log(`Message: ${message}`);
                    const openaires = await send_to_openai(req)
                    console.log(openaires)
                    if (openaires?.length) {
                        await message.say(openaires);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
    try {
        await bot.start();
    } catch (e) {
        console.error(
            `⚠️ Bot start failed, can you log in through wechat on the web?: ${e}`
        );
    }
}
main();
