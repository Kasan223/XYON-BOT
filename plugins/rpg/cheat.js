let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    
    // Cek apakah sudah pernah cheat
    if (user.cheatActivated) {
        throw `❌ *CHEAT SUDAH PERNAH DIKTAIFKAN!*\n\nKamu sudah aktivasi cheat sebelumnya dan data sudah permanen!`
    }
    
    // Cek minimal money
    if (user.money < 2000000) {
        throw `❌ *GAGAL AKTIFKAN CHEAT!*\n\nMinimal butuh *2,000,000 money* untuk aktivasi cheat!\nYahaha miskin banget sih mau ngecheat! 😂`
    }
    
    // Aktifkan cheat (hanya sekali)
    user.money = Infinity
    user.limit = Infinity
    user.cheatActivated = true
    user.cheatTimestamp = new Date().getTime()
    
    m.reply(`🎮 *CHEAT ACTIVATED!* 🎮

💰 Money: ♾️ Infinity
🎫 Limit: ♾️ Infinity

✅ *Cheat berhasil diaktifkan!*
🛡️ Data akan bertahan permanen
⚡ Hanya bisa sekali seumur hidup!
🎯 Gunakan dengan bijak!`)
}

handler.command = /^(cheat)$/i
handler.owner = false
handler.premium = true
handler.rpg = true

module.exports = handler

// ===== FITUR ANTI-RESET PERMANEN =====
function maintainCheatData() {
    if (global.db && global.db.data && global.db.data.users) {
        for (let user in global.db.data.users) {
            let userData = global.db.data.users[user];
            
            // Jika user pernah aktivasi cheat, pertahankan datanya selamanya
            if (userData.cheatActivated) {
                userData.money = Infinity
                userData.limit = Infinity
            }
        }
    }
}

// Jalankan maintenance setiap 30 menit untuk jaga data
setInterval(maintainCheatData, 1800000)

// Jalankan saat bot start
if (global.db) {
    setTimeout(maintainCheatData, 3000)
}