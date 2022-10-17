import fs from 'fs';
import path from "path";

export let config = null;

export const appPath = path.dirname(require.main.filename);

try {
	console.log('load config', appPath + '/config.json')
	config = JSON.parse(fs.readFileSync(appPath + '/config.json').toString());
} catch (e) {
	console.log('ERROR LOAD CONFIG')
	process.exit();
}

