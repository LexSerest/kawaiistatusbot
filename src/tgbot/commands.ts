import {Markup} from "telegraf";
import {getInfo} from "@/getinfo";
import {bot} from "./bot";

let markup = Markup.inlineKeyboard([Markup.button.callback('Обновить', 'reload')]);

bot.command('status', async ctx => {
	try {
		let text = await getInfo();
		await ctx.replyWithHTML(text, {...markup, disable_web_page_preview: true});
	} catch (e) {
		console.log('[WARN] ' + e)
	}
})

bot.action('reload', async ctx => {
	try {
		let text = await getInfo();
		await ctx.editMessageText(text, {...markup, parse_mode: 'HTML', disable_web_page_preview: true})
	} catch (e) {
	} finally {
		await ctx.answerCbQuery('Обновлено');
	}
})

