global.owner = ['6285185032092', '6285641142178', '252540218294511']  
global.mods = ['6285185032092', '43431212654819'] 
global.prems = ['6285185032092', '6287775524661', '6287783022502',  '43431212654819']
global.nameowner = 'Leo'
global.numberowner = '6285185032092', '6285641142178',
global.mail = 'cs@kasan.id' 
global.gc = ''
global.opts = { self: false }
global.instagram = 'https://instagram.com/'
global.wm = '© Shanove'
global.wait = '_*Tunggu sedang di proses...*_'
global.eror = '_*Server Error*_'
global.stiker_wait = '*⫹⫺ Stiker sedang dibuat...*'
global.packname = 'made by'
global.author = 'Kasan '
global.maxwarn = '2' // Peringatan maksimum
global.antiporn = true // Auto delete pesan porno (bot harus admin)

//INI WAJIB DI ISI!//
global.lann = 'Kasan.7'
global.aksesKey = '' // Register dan buy 
//Daftar terlebih dahulu https://api.betabotz.eu.org

//INI OPTIONAL BOLEH DI ISI BOLEH JUGA ENGGA//
global.btc = 'YOUR_APIKEY_HERE'
//Daftar https://api.botcahx.eu.org 

global.APIs = {   
  lann: 'https://api.betabotz.eu.org',
  btc: 'https://api.botcahx.eu.org'
}
global.APIKeys = { 
  'https://api.betabotz.eu.org': global.lann, 
  'https://api.botcahx.eu.org': global.btc //OPSIONAL
}

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})