(async () => {
  require('./config')
  const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser
  } = require("@adiwajshing/baileys")
  const pino = require('pino')
  const WebSocket = require('ws')
  const path = require('path')
  const fs = require('fs')
  const yargs = require('yargs/yargs')
  const cp = require('child_process')
  const _ = require('lodash')
  const syntaxerror = require('syntax-error')
  const os = require('os')
  const readline = require('readline')

  let simple = require('./lib/simple')
  var low
  try {
    low = require('lowdb')
  } catch (e) {
    low = require('./lib/lowdb')
  }
  const { Low, JSONFile } = low
  const mongoDB = require('./lib/mongoDB')

  // Helper untuk Pairing Code
  const question = (text) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise((resolve) => {
      rl.question(text, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  };

  global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({
    ...query,
    ...(apikeyqueryname ? {
      [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]
    } : {})
  })) : '')

  global.timestamp = {
    start: new Date
  }

  const PORT = process.env.PORT || 3000

  global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
  global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

  global.db = new Low(
    /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
    new mongoDB(opts['db']) :
    new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
  )
  global.DATABASE = global.db
  global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(function() {
      (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null)
    }, 1 * 1000))
    if (global.db.data !== null) return
    global.db.READ = true
    await global.db.read()
    global.db.READ = false
    global.db.data = {
      users: {},
      chats: {},
      stats: {},
      msgs: {},
      sticker: {},
      ...(global.db.data || {})
    }
    global.db.chain = _.chain(global.db.data)
  }
  loadDatabase()

  const authFile = `${opts._[0] || 'sessions'}`
  global.isInit = !fs.existsSync(authFile)
  const { state, saveCreds } = await useMultiFileAuthState(authFile)
  const { version } = await fetchLatestBaileysVersion()

  // --- CONFIG KONEKSI ---
  const connectionOptions = {
    printQRInTerminal: !opts['pairing'], // QR tidak muncul jika mode pairing aktif
    syncFullHistory: true,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    logger: pino({ level: 'silent' }),
    version,
  }

  global.conn = simple.makeWASocket(connectionOptions)

  // --- LOGIKA PAIRING CODE ---
  if (opts['pairing'] && !conn.authState.creds.registered) {
      console.log(`\n🔹 Menunggu Pairing Code...`);
      setTimeout(async () => {
          let phoneNumber = await question('📞 Masukkan Nomor WhatsApp Bot (Cth: 628xxx): ');
          phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
          let code = await conn.requestPairingCode(phoneNumber)
          code = code?.match(/.{1,4}/g)?.join("-") || code
          console.log(`\n🔑 KODE PAIRING: \x1b[32m${code}\x1b[0m\n`);
      }, 3000)
  }

  if (!opts['test']) {
    if (global.db) setInterval(async () => {
      if (global.db.data) await global.db.write()
      if (!opts['tmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp'], tmp.forEach(filename => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])))
    }, 30 * 1000)
  }

  async function connectionUpdate(update) {
    const { connection, lastDisconnect } = update
    global.timestamp.connect = new Date
    if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut && conn.ws.readyState !== WebSocket.CONNECTING) {
      console.log(global.reloadHandler(true))
    }
    if (global.db.data == null) await loadDatabase()
    if (connection === 'open') {
        console.log('✅ Bot Berhasil Terhubung!');
    }
  }

  process.on('uncaughtException', console.error)

  const imports = (path) => {
    path = require.resolve(path)
    let modules, retry = 0
    do {
      if (path in require.cache) delete require.cache[path]
      modules = require(path)
      retry++
    } while ((!modules || (Array.isArray(modules) || modules instanceof String) ? !(modules || []).length : typeof modules == 'object' && !Buffer.isBuffer(modules) ? !(Object.keys(modules || {})).length : true) && retry <= 10)
    return modules
  }

  let isInit = true
  global.reloadHandler = function(restatConn) {
    let handler = imports('./handler')
    if (restatConn) {
      try { global.conn.ws.close() } catch {}
      global.conn = {
        ...global.conn,
        ...simple.makeWASocket(connectionOptions)
      }
    }
    if (!isInit) {
      conn.ev.off('messages.upsert', conn.handler)
      conn.ev.off('group-participants.update', conn.participantsUpdate)
      conn.ev.off('message.delete', conn.onDelete)
      conn.ev.off('connection.update', conn.connectionUpdate)
      conn.ev.off('creds.update', conn.credsUpdate)
    }

    conn.welcome = 'Welcome @user 👋 In Groups @subject\nDont Forget To Obey The Existing Rules'
    conn.bye = 'Goodbye @user 👋'
    conn.promote = '@user sekarang admin!'
    conn.demote = '@user sekarang bukan admin!'
    conn.handler = handler.handler.bind(conn)
    conn.participantsUpdate = handler.participantsUpdate.bind(conn)
    conn.onDelete = handler.delete.bind(conn)
    conn.connectionUpdate = connectionUpdate.bind(conn)
    conn.credsUpdate = saveCreds.bind(conn)

    conn.ev.on('messages.upsert', conn.handler)
    conn.ev.on('group-participants.update', conn.participantsUpdate)
    conn.ev.on('message.delete', conn.onDelete)
    conn.ev.on('connection.update', conn.connectionUpdate)
    conn.ev.on('creds.update', conn.credsUpdate)
    isInit = false
    return true
  }

  // --- RECURSIVE PLUGIN LOADER (BACA FOLDER BERTINGKAT) ---
  let pluginFolder = path.join(__dirname, 'plugins')
  
  const getAllFiles = (dirPath, arrayOfFiles) => {
      files = fs.readdirSync(dirPath)
      arrayOfFiles = arrayOfFiles || []
      files.forEach(function(file) {
          if (fs.statSync(dirPath + "/" + file).isDirectory()) {
              arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
          } else {
              if (file.endsWith('.js')) arrayOfFiles.push(path.join(dirPath, "/", file))
          }
      })
      return arrayOfFiles
  }

  global.plugins = {}
  let pluginFiles = getAllFiles(pluginFolder)
  
  for (let filename of pluginFiles) {
    try {
      global.plugins[filename] = require(filename)
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
  
  console.log(`🧩 Total ${Object.keys(global.plugins).length} Plugins Terload (Recursive)`)

  global.reload = (_ev, filename) => {
    // Logic reload disederhanakan untuk stabilitas
    if (/\.js$/.test(filename)) {
      let dir = path.join(pluginFolder, filename) // Note: ini mungkin perlu penyesuaian jika filename absolute
      // Untuk watcher sederhana, kita gunakan path absolute dari event
      if (fs.existsSync(filename)) { // Jika filename dari watcher adalah path absolute
         dir = filename
      } 
      
      if (dir in require.cache) {
        delete require.cache[dir]
        if (fs.existsSync(dir)) conn.logger.info(`re - require plugin '${path.basename(dir)}'`)
        else {
          conn.logger.warn(`deleted plugin '${path.basename(dir)}'`)
          return delete global.plugins[dir]
        }
      } else conn.logger.info(`requiring new plugin '${path.basename(dir)}'`)
      
      let err = syntaxerror(fs.readFileSync(dir), dir)
      if (err) conn.logger.error(`syntax error while loading '${path.basename(dir)}'\n${err}`)
      else try {
        global.plugins[dir] = require(dir)
      } catch (e) {
        conn.logger.error(e)
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
      }
    }
  }
  
  Object.freeze(global.reload)
  fs.watch(pluginFolder, { recursive: true }, global.reload) // Enable Recursive Watch
  global.reloadHandler()

  // Quick Test
  async function _quickTest() {
    let test = await Promise.all([
      cp.spawn('ffmpeg'),
      cp.spawn('ffprobe'),
      cp.spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
      cp.spawn('convert'),
      cp.spawn('magick'),
      cp.spawn('gm'),
      cp.spawn('find', ['--version'])
    ].map(p => {
      return Promise.race([
        new Promise(resolve => {
          p.on('close', code => {
            resolve(code !== 127)
          })
        }),
        new Promise(resolve => {
          p.on('error', _ => resolve(false))
        })
      ])
    }))
    let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
    // console.log(test)
    let s = global.support = {
      ffmpeg,
      ffprobe,
      ffmpegWebp,
      convert,
      magick,
      gm,
      find
    }
    Object.freeze(global.support)
  }

  _quickTest()
    .then(() => conn.logger.info('✅ Quick Test Done'))
    .catch(console.error)
})()