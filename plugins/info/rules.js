// File: rules.js

// Fungsi clockString yang lebih rapi
function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    
    // Output: D Hari H Jam M Menit S Detik
    return [
        d > 0 ? d + ' Hari' : '',
        h > 0 ? h + ' Jam' : '',
        m > 0 ? m + ' Menit' : '',
        s > 0 ? s + ' Detik' : ''
    ].filter(Boolean).join(' '); // Filter(Boolean) untuk menghapus nilai kosong
}

let handler = async (m, { conn }) => {
    let wm = global.wm || 'Xyon - MD';
    let _uptime = process.uptime() * 1000;
    let uptimex = clockString(_uptime);
    
    // Ganti URL thumbnail ini dengan gambar yang lebih keren jika ada!
    const THUMBNAIL_URL = "https://telegra.ph/file/dc5a67d724b016574129b.jpg"; 
    const LAST_UPDATED = '26 November 2025'; // Update tanggal agar terlihat baru

    let rulesText = `
👑 *━━━ PERATURAN RESMI XYON - MD ━━━* 👑

Selamat datang! Gunakan Bot dengan bijak & bertanggung jawab.
Melanggar aturan di bawah ini = *BLOKIR PERMANEN*.

╔═══════ *🛡️ KEBIJAKAN PRIVASI*
║ 1. Bot *TIDAK MENYIMPAN* riwayat chat, media, atau data personal.
║ 2. Nomor pengguna *TIDAK* akan dibagikan ke pihak manapun.
║ 3. Data yang diproses bersifat sementara & otomatis dihapus.
║ 4. Privasi Anda adalah prioritas kami (100% aman).
╚══════════════════════

╔═══════ *📜 SYARAT & KETENTUAN*
║ 1. Pengguna bertanggung jawab penuh atas penyalahgunaan fitur.
║ 2. Bot berhak keluar grup jika masa sewa berakhir atau melanggar S&K.
║ 3. Developer akan segera memperbaiki *bug* atau kesalahan server.
╚══════════════════════

╔═══════ *🚫 PERATURAN KETAT (WAJIB DIBACA)*
║ 1. 📞 Dilarang keras *menelpon/video call* nomor bot.
║ 2. 💣 Dilarang mengirim *bug*, *virus*, *virtex*, atau konten merusak.
║ 3. 💥 Dilarang melakukan *spam* berlebihan terhadap perintah bot.
║ 4. 🔗 Dilarang menculik/menyalin bot tanpa izin Owner.
║ 5. 🔞 Dilarang menggunakan fitur *18+* jika bukan Premium/di bawah 18 tahun.
║ 6. 🔥 DILARANG KERAS membuat/mengirim konten berbau:
║    • Porno / NSFW / Gore
║    • Ujaran kebencian, SARA, atau pelecehan
║    • Konten jorok, cabul, atau tidak senonoh
║ 7. 😠 Dilarang menghina/mengganggu Owner atau Bot secara tidak sopan.
╚══════════════════════

🚨 *KONSEQUENSI PELANGGARAN*
Jika melanggar salah satu poin di atas, Anda akan langsung:
> 🔒 *Diblokir Permanen*
> 🚫 *Di-Blacklist Global*
> 💥 *Di-Auto-Kick dari Semua Grup Bot*

─────────────────────
🗓️ *Terakhir Diperbarui:* ${LAST_UPDATED}
⏰ *Uptime Bot:* ${uptimex}
─────────────────────
💡 Gunakan bot dengan cerdas, bertanggung jawab, dan saling menghargai!
`.trim();

    await conn.sendMessage(m.chat, {
        text: rulesText,
        contextInfo: {
            externalAdReply: {
                title: "❌ BACA DENGAN TELITI - HINDARI BLOKIR ❌",
                body: "Peraturan Resmi Xyon - MD",
                thumbnailUrl: THUMBNAIL_URL,
                sourceUrl: "",
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m });
}

handler.help = ['rules', 'peraturan']
handler.tags = ['info']
handler.command = /^(rules|peraturan|ketentuan)$/i  // Menambah alias
handler.limit = false

module.exports = handler;