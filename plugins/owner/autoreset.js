const schedule = require('node-schedule');

let handler = async (m, { conn, isOwner }) => {
    // --- LOGIKA RESET MANUAL (Lewat Command) ---
    // Cuma bisa dipanggil Owner
    if (!isOwner) return
    
    m.reply('⏳ _Sedang mereset limit semua user..._')
    
    let users = global.db.data.users
    let count = 0
    
    for (let jid in users) {
        let user = users[jid]
        if (user) {
            // Settingan Jumlah Limit
            let limitFree = 100    // Limit User Gratis
            let limitPrem = 10000  // Limit User Premium
            
            user.limit = user.premium ? limitPrem : limitFree
            count++
        }
    }
    
    m.reply(`✅ *SUKSES!* Limit ${count} user telah direset ke awal.`)
}

// --- LOGIKA AUTO RESET (Jalan Otomatis Jam 00:00) ---
// Cek variabel global biar job tidak dobel saat file di-reload
if (!global.isResetScheduled) {
    global.isResetScheduled = true
    
    // Format Cron: 'detik menit jam * * *'
    // '0 0 0 * * *' artinya Jam 00:00:00 Setiap Hari
    schedule.scheduleJob('0 0 0 * * *', () => {
        console.log('⏰ [AUTO-RESET] Memulai reset limit harian...')
        
        let users = global.db.data.users
        let resetCount = 0
        
        for (let jid in users) {
            let user = users[jid]
            if (user) {
                // Limit Default
                let limitFree = 100
                let limitPrem = 10000
                
                // Reset Limit
                user.limit = user.premium ? limitPrem : limitFree
                resetCount++
            }
        }
        
        console.log(`✅ [AUTO-RESET] Selesai! ${resetCount} user berhasil direset.`)
    })
    
    console.log('📅 Jadwal Auto-Reset Limit berhasil dipasang (00:00 WIB).')
}

handler.help = ['resetlimit']
handler.tags = ['owner']
handler.command = /^(resetlimit|resetall)$/i
handler.owner = true

module.exports = handler