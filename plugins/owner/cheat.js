let { MessageType } = require('@adiwajshing/baileys')

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
        conn.reply(m.chat, `*Succes cheat sebesar*\nMoney: ♾️\nLimit: ♾️\nLevel: ♾️`, m)
        global.db.data.users[m.sender].money = Infinity
        global.db.data.users[m.sender].limit = Infinity 
        global.db.data.users[m.sender].level = Infinity 
        
}
handler.help = ['cheat-owner']
handler.tags = ['owner']
handler.command = /^(cheato)$/i
handler.owner = true
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.money = 0

module.exports = handler