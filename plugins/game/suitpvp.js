/* 
    Made by https://github.com/syahrularranger 
    Jangan di hapus credit nya :)
*/
let timeout = 60000
let poin = 500
let poin_lose = -100

let handler = async (m, { conn, usedPrefix }) => {
  conn.suit = conn.suit ? conn.suit : {}
  
  // Cek jika user sedang bermain suit
  if (Object.values(conn.suit).find(room => room.id.startsWith('suit') && [room.p, room.p2].includes(m.sender))) {
    return m.reply('❌ *Selesaikan suit mu yang sebelumnya!*')
  }
  
  // Validasi mentioned user
  if (!m.mentionedJid[0] || m.mentionedJid[0] === m.sender) {
    return m.reply(`🎯 *TAG LAWAN MU!*\n\nContoh:\n${usedPrefix}suit @tag_user\n\nTag user yang ingin kamu tantang!`)
  }
  
  // Cek jika lawan sedang bermain
  if (Object.values(conn.suit).find(room => room.id.startsWith('suit') && [room.p, room.p2].includes(m.mentionedJid[0]))) {
    return m.reply('⚡ *Orang yang kamu tantang sedang bermain suit!*')
  }
  
  let id = 'suit_' + new Date() * 1
  let player1 = m.sender.split('@')[0]
  let player2 = m.mentionedJid[0].split('@')[0]
  
  let caption = `
╭───「 *🎮 SUIT PvP* 」
│
│ ◦ 🎯 *Penantang:* @${player1}
│ ◦ 🎯 *Ditantang:* @${player2}
│
│ ◦ ⏰ *Timeout:* 60 detik
│ ◦ 🏆 *Poin Menang:* ${poin}
│ ◦ 💔 *Poin Kalah:* ${poin_lose}
│
╰───「 *BOT GAME* 」

@${player2} - Silakan ketik *"terima"* untuk mulai atau *"tolak"* untuk menolak tantangan!
  `.trim()

  conn.suit[id] = {
    chat: await conn.sendMessage(m.chat, {
      text: caption,
      mentions: [m.sender, m.mentionedJid[0]]
    }),
    id: id,
    p: m.sender,
    p2: m.mentionedJid[0],
    status: 'wait',
    waktu: setTimeout(() => {
      if (conn.suit[id]) {
        conn.sendMessage(m.chat, {
          text: `⏰ *Waktu habis!*\nTantangan suit dibatalkan.`,
          mentions: [m.sender, m.mentionedJid[0]]
        })
        delete conn.suit[id]
      }
    }, timeout),
    poin: poin,
    poin_lose: poin_lose,
    timeout: timeout
  }
}

handler.tags = ['game']
handler.help = ['suit', 'suitpvp'].map(v => v + ' @tag')
handler.command = /^(suit|suitpvp)$/i
handler.limit = false
handler.group = true

module.exports = handler