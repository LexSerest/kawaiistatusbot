import {Telegraf, Composer} from "telegraf";

export function sleep(ms: number) {
  return new Promise((res, rej) => setTimeout(res, ms));
}

export async function bot_start(bot: Telegraf){
  try {
    await bot.launch({dropPendingUpdates: true})
    console.log('Bot start! @' + bot.botInfo.username)
  } catch (e) {
    console.log('[WARN]', e)
    await sleep(6000);
    bot.stop();
    bot_start(bot);
  }
}

export function ignoreOldMsg(afterMinutes = 5){
  return Composer.on('message', (ctx, next) => {
    if (Date.now() / 1000 - ctx.message.date < afterMinutes * 60) {
      return next();
    }
  })
}
