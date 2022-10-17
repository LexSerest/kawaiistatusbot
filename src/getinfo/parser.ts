import net from "net";

function varInt(buffers) {
  let result = 0;
  let numpad = 0;
  for (let e of buffers) {
    result |= (e & 0b01111111) << (7 * numpad);
    if (numpad > 5) {
      result = 0;
      break;
    }
    numpad++;
    if ((e & 0b10000000) == 0) break
  }
  return {result, buf: buffers.slice(numpad), length: numpad};
}

const Uint16BE = (i) => Buffer.from(Uint16Array.of(i).buffer).reverse()
const toBuf = (arr) => Buffer.concat(arr.map(e => Buffer.from(typeof e == 'string' || (e instanceof Buffer) ? e : [e])))

function createBuffer(server, port) {
  const buf_data = toBuf([0, 127, server.length, server, Uint16BE(port), 1])
  return toBuf([buf_data.length, buf_data, 1, 0]);
}

function getMods(data) {
  return data.forgeData ? data.forgeData.mods.reduce((prev, e) => {
    prev[e.modId] = e.modmarker;
    return prev
  }, {}) : []
}

export function loadInfo(server, port= 25565, timeout = 3000, is_raw = false) {
  return new Promise((res, rej) => {
    let size = 0;
    let read_byte = 0;
    let data = [];
    let status = 1;
    let date = 0;
    try {
      let sock = net.connect(port, server, () => {
        date = Date.now();
        sock.write(createBuffer(server, port))
      })
      sock.setTimeout(timeout);
      sock.on('error', (e: any) => res({ok: false, error: e.code}));
      sock.on('timeout', function () {
        sock.end();
        res({ok: false, error: 'timeout'})
      })

      sock.on('data', e => {
        let time_reply = Date.now() - date;
        read_byte += e.length;
        if (status == 2) data.push(e);
        if (status == 1) {
          let {result, buf, length} = varInt(e);
          size = result;
          read_byte -= length;
          let pad = 0;
          while (buf[pad] != '{'.charCodeAt(0)) pad++;
          data.push(buf.slice(pad));
          status = 2;
        }
        if (size == read_byte) {
          sock.end();
          let data_str = Buffer.concat(data).toString()
          let reply: any = {};
          try {
            if(is_raw) return res(data_str);
            else reply = JSON.parse(data_str);
            reply.time_reply = time_reply;
            reply.ok = true;
          } catch (e) {
            console.log("JSON PARSE ERROR", e);
          }
          res(reply);
        }
      })
    } catch (e) {
      res({ok: false, error: e.code})
    }
  })
}

export async function parseInfo(server, port= 25565, timeout = 3000) {
  let data: any = await loadInfo(server, port, timeout);
  let res: any = {ok: true};

  if (!data || !data.ok || data.error) {
    res.ok = false;
    res.error = data.error;
  } else {
    const mods = getMods(data);
    if(mods.length) res.mods = mods;
    res.times = data.time_reply;

    if (data.players) {
      res.count = data.players.online;
      res.players = data.players.sample ? data.players.sample.map(e => e && e.name ? e.name : null).filter(e => e).sort() : [];
      res.max = data.players.max;
    }
    let version = data.version.name.match(/([\d\.-]+)/);
    res.version = version && version[0] ? version[0] : "unknown";
    if(res.description) {
      res.description = data.description ? data.description.text : '';
      if (data.description["extra"]) {
        for (let e of data.description["extra"]) {
          if (e.text) res.description += e.text;
        }
      }
      res.description = res.description.trim()
    }
  }
  return res;
}
