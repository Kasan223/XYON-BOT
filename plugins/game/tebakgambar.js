let timeout = 100000
let poin = 10000
let src
let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakgambar = conn.tebakgambar ? conn.tebakgambar : {}
  let id = m.chat
  if (id in conn.tebakgambar) {
    conn.reply(m.chat, '🎮 *SOAL MASIH BERLANGSUNG!*\n\nJawab soal sebelumnya dulu ya!', conn.tebakgambar[id][0])
    throw false
  }
  
  if (!src) src = await (await fetch(`https://api.betabotz.eu.org/api/game/tebakgambar?apikey=${lann}`)).json()
  let json = src[Math.floor(Math.random() * src.length)]
  if (!json) throw "❌ *ERROR!*\nSilahkan ulangi perintah!"
  
  let caption = `
🖼️ *TEBAK GAMBAR*

📝 *Deskripsi:* ${json.deskripsi}
⏰ *Timeout:* ${(timeout / 1000).toFixed(2)} detik
💰 *Bonus:* ${poin.toLocaleString()} money

💡 *Tips:* 
• Ketik *${usedPrefix}hint* untuk bantuan
• *Reply* pesan ini untuk menjawab
• Jawaban tidak case sensitive

🎯 *Siap menebak?*
└───···───┘
`.trim()

  conn.tebakgambar[id] = [
    await conn.sendMessage(m.chat, { 
      image: { url: json.img }, 
      caption: caption
    }, { quoted: m }),
    json, 
    poin,
    setTimeout(() => {
      if (conn.tebakgambar[id]) {
        conn.reply(m.chat, `⏰ *WAKTU HABIS!*\n\nJawaban yang benar: *${json.jawaban}*`, conn.tebakgambar[id][0])
        delete conn.tebakgambar[id]
      }
    }, timeout)
  ]
}

// Handler untuk menangani jawaban
handler.before = async (m, { conn }) => {
  conn.tebakgambar = conn.tebakgambar ? conn.tebakgambar : {}
  let id = m.chat
  if (!(id in conn.tebakgambar)) return
  
  // Skip jika pesan adalah command
  if (m.text.startsWith('/') || m.text.startsWith('.') || m.text.startsWith('!')) return
  
  let data = conn.tebakgambar[id]
  let json = data[1]
  let poin = data[2]
  
  // Normalisasi jawaban (hapus spasi, ubah ke lowercase, hapus karakter khusus)
  let userAnswer = m.text.toLowerCase().trim().replace(/[^\w\s]/gi, '')
  let correctAnswer = json.jawaban.toLowerCase().trim().replace(/[^\w\s]/gi, '')
  
  // Cek apakah ini reply ke pesan game tebakgambar
  let isReplyToGame = false
  try {
    if (m.quoted && m.quoted.id) {
      let quotedMsg = await conn.loadMessage(m.chat, m.quoted.id)
      if (quotedMsg && quotedMsg.imageMessage) {
        isReplyToGame = true
      }
    }
  } catch (e) {
    // Jika tidak bisa memuat quoted message, anggap bukan reply ke game
    isReplyToGame = false
  }
  
  // Jika bukan reply ke game, skip
  if (!isReplyToGame) return
  
  if (userAnswer === correctAnswer) {
    global.db.data.users[m.sender].money += poin
    
    // Reply langsung ke pesan user yang menjawab benar
    await conn.reply(m.chat, `🎉 *BENAR!*\n\nJawaban: *${json.jawaban}*\n+${poin.toLocaleString()} money`, m)
    
    // Hapus game setelah jawaban benar
    clearTimeout(data[3])
    delete conn.tebakgambar[id]
    return true
  } else {
    // Jawaban salah - beri tahu user
    await conn.reply(m.chat, `❌ *SALAH!*\n\nCoba tebak lagi!`, m)
    return true
  }
}

// Handler untuk hint
handler.help = ['tebakgambar']
handler.tags = ['game']
handler.command = /^(tebakgambar|tg)$/i
handler.limit = false
handler.group = true

module.exports = handler