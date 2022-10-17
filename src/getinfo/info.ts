import {parseInfo} from "./parser";
import { config } from "@/config";

const servers = config.servers;
let cache = '';
let cache_date = 0;

export async function getInfo(): Promise<string> {
  if(cache && cache_date > Date.now() - (config.update_times_ms || 30000) + 1) {
    console.log('Use cache');
    return cache;
  }
  console.log('Get info');
  cache_date = Date.now();

  let text = '';
  for (let server of servers){
    if(!server || !server[0]) continue;

    const name = server[0];
    const addr = server[1];
    let [ip, port] = server[1].split(':');
    if(!port) port = "25565";

    const info = await parseInfo(ip, +port);
    if(info.ok){
      let status = info.ok ? '🟢' : '🔴';
      text += `${status} <b>${name}</b> \n`;
      if(info.ok) {
        text = text.trim();
        text += ` | ${info.version} | ${info.count} из ${info.max} \n`
        text += (info.count || server[2]) ? '├─' : '└─';
        text += ` IP: <code>${addr}</code>  ${info.times}ms\n`;

        if(server[2]) {
          text += (info.count ? '├─ ' : '└─ ') + server[2] + '\n';
        }
        if (info.count) {
          text += '└─ 👶: ' + info.players.join(', ') + '\n'
        }
      }
      text += ' \n'
    }
  }

  text = text.trim() || "Все сервера отключены";
  cache = text;
  return cache;
}

export function init_auto(){
  console.log('Start auto update', config.update_times_ms || 30000);
  setInterval(() => getInfo(), config.update_times_ms || 30000);
  getInfo();
}
