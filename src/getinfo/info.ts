import {parseInfo} from "./parser";
import config from "@/config.json";

const servers = config.servers;
let cache = '';
let cache_date = 0;

export async function getInfo(): Promise<string> {
	if(cache && cache_date > Date.now() - (config.update_times_ms || 30000) - 1) return cache;
	cache_date = Date.now();

	let text = '';
	for (let server of servers){
		const name = server[0];
		const addr = server[1];
		let [ip, port] = server[1].split(':');
		if(!port) port = "25565";

		const info = await parseInfo(ip, +port);
		let status = info.ok ? '🟢 Доступен' : '🔴 Умер';
		text += `<b>${name}</b>: ${status}\n`;
		if(info.ok) {
			text += `├─ Версия: ${info.version}\n`
			text += `├─ IP: <code>${addr}</code>\n`;
			if(server[2]) text += '├─ ' + server[2] + '\n';
			text += info.count ? '├─' : '└─';
			text += `👶 ${info.count} из ${info.max}\n`;
			if (info.count) {
				text += '└─ ' + info.players.join(', ') + '\n'
			}
		}
		text += ' \n'
	}

	cache = text.trim();
	return cache;
}

export function init(){
	setInterval(() => getInfo(), config.update_times_ms || 30000);
	getInfo();
}
