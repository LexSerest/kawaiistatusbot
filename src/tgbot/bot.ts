import {Telegraf} from "telegraf";
import config from "../config.json";

export const bot = new Telegraf(config.bot_token);
