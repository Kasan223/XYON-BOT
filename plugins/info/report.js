let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `⚠️ *Kamu harus menulis laporan errornya!*\n\nContoh:\n${usedPrefix + command} Fitur tebak kata tidak muncul gambar.`;

    let id_owner = '6285185032092'; // Ganti dengan nomor WhatsApp owner kamu
    let name = m.pushName || 'Anonim';
    let chat = m.chat || 'Private Chat';
    let date = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    let caption = `
🔧 *Laporan Error Baru* 🔧

👤 *Dilaporkan oleh:* ${name} (@${m.sender.split('@')[0]})
💬 *Chat:* ${chat === 'status@broadcast' ? 'Status' : chat}
📅 *Waktu:* ${date}

📝 *Laporan:*
${text}

🔍 *Pesan terkait:*
${m.text || '(tidak ada pesan terkait)'}

⚠️ *Catatan:*
Fitur ini digunakan untuk melaporkan bug atau error. Jika spam, kamu bisa diblokir.
`;

    // Kirim laporan ke owner
    await conn.sendMessage(id_owner + '@s.whatsapp.net', {
        text: caption,
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true
        }
    });

    // Balas ke user bahwa laporan telah dikirim
    m.reply('✅ Terima kasih, laporan kamu telah dikirim ke owner. Kami akan segera mengeceknya.');
};

handler.help = ['report', 'lapor'].map(v => v + ' <pesan>');
handler.tags = ['info'];
handler.command = /^(report|lapor)$/i;

module.exports = handler;