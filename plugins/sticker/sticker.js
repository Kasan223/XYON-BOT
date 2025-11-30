const fs = require('fs')
const sharp = require('sharp') 

let handler = async (m, { conn, command, usedPrefix }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  if (/image/.test(mime)) {
    let media = await q.download()

    let processedMedia = await sharp(media)
      .resize(512, 512, {
        fit: 'cover', // Ubah dari 'contain' ke 'cover' untuk memastikan 1:1
        position: 'center', // Posisi tengah untuk crop
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      })
      .png()
      .toBuffer()

    let encmedia = await conn.sendImageAsSticker(m.chat, processedMedia, m, { 
      packname: global.packname, 
      author: global.author 
    })
    await fs.unlinkSync(encmedia)
    
  } else if (/video/.test(mime)) {
    if ((q.msg || q).seconds > 7) return m.reply('⏱️ Maksimal 7 detik!')
    let media = await q.download()

    let encmedia = await conn.sendVideoAsSticker(m.chat, media, m, { 
      packname: global.packname, 
      author: global.author 
    })
    await fs.unlinkSync(encmedia)
    
  } else {
    throw `📸 Kirim gambar/video dengan caption ${usedPrefix + command}\n⏱️ Durasi video maksimal 7 detik.`
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = /^(stiker|s|sticker|stik)$/i
handler.limit = true

module.exports = handler