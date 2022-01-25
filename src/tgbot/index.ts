import {bot_start, ignoreOldMsg} from "@/libs";
import {bot} from "./bot";

export async function init_bot(){
	bot.use(ignoreOldMsg());
	await import('./commands');
	bot_start(bot);
}
