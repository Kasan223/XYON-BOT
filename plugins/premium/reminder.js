let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    // --- 1. CEK PREMIUM & OWNER SECARA MANUAL ---
    // Mengambil data user langsung dari database global untuk memastikan status
    let user = global.db.data.users[m.sender]
    
    // Logic: Jika user Premium ATAU Owner, maka boleh akses.
    let isPremium = user && (user.premium || isOwner) 

    if (!isPremium) {
        return conn.reply(m.chat, `
┌  🔒 *ACCESS DENIED*
│  
│  Fitur ini eksklusif untuk
│  *Premium User*.
│  
└  Upgrade: *${usedPrefix}premium*
`.trim(), m)
    }

    // --- 2. CEK INPUT ---
    if (!text) {
        return conn.reply(m.chat, `
┌  ⏰ *SET REMINDER*
│  
│  Gunakan format:
│  *${usedPrefix + command} <waktu> <pesan>*
│  
│  • s = detik
│  • m = menit
│  • h = jam
│  • d = hari
│  
└  *Contoh:* ${usedPrefix + command} 10m Matikan kompor
`.trim(), m)
    }

    // --- 3. PROSES PARSING WAKTU ---
    let args = text.split(' ')
    let duration = args[0]
    let msg = args.slice(1).join(' ')
    
    if (!msg) return m.reply('❌ Pesannya mana? Tulis pesan yang ingin diingatkan.')

    let timer = parseTime(duration)
    if (!timer) return m.reply('❌ Format waktu salah! Gunakan angka+kode s/m/h/d (Contoh: 10m)')

    // --- 4. KIRIM KONFIRMASI (STYLE MINIMALIS) ---
    conn.reply(m.chat, `
┌  ✅ *REMINDER SET*
│  
│  📝 *Note:* "${msg}"
│  ⏱️ *Time:* ${duration}
│  
└  _Aku akan mengingatkanmu nanti._
`.trim(), m)

    // --- 5. JALANKAN TIMER ---
    setTimeout(() => {
        let alertMsg = `
┌  🔔 *REMINDER ALERT*
│  
│  Halo @${m.sender.split('@')[0]},
│  Waktunya:
│  
│  "${msg}"
│  
└  _Reminder selesai._
`.trim()

        conn.reply(m.chat, alertMsg, m, {
            mentions: [m.sender] // Mention agar notif masuk
        })
    }, timer)
}

handler.help = ['remind <waktu> <pesan>', 'ingetin']
handler.tags = ['premium', 'tools']
handler.command = /^(remind|reminder|ingetin|alarm)$/i

module.exports = handler


// --- HELPER FUNCTION (Logic konversi waktu) ---
function parseTime(str) {
    let args = str.match(/([0-9]+)([smhd])/);
    if (!args) return null;
    let n = parseInt(args[1]);
    let type = args[2];
    
    let multiply = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };
    
    return n * multiply[type];
}