let net = require('net');

export function getSmallInfo(ip, port) {
	return new Promise((res, rej) => {
		let sock = net.connect(port, ip, () => {
			try {
				sock.write(Buffer.from([254, 1]))
			} catch (e) {
				res({ online: false })
			}
		});

		sock.setTimeout(200);
		sock.on('timeout', function() {
			sock.end();
			res({ online: false })
		})

		sock.on('data', e => {
			let data = e.toString('utf16le').split('\x00');
			console.log(data);
			res({
				title: data[3],
				ver: data[2],
				players: data[4],
				online: true
			})
			sock.end();
		})
		sock.on('error', e => res({ online: false }))
	})
}
