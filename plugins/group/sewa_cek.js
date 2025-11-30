let handler = async (m, { conn, usedPrefix, command }) => {
    // Ambil data chats (struktur yang digunakan oleh addsewa)
    let chats = global.db.data.chats || {};

    // Ambil JID grup
    let groupJid = m.chat;

    // Ambil data sewa untuk grup ini dari chats
    let dataSewa = chats[groupJid];

    // Jika tidak ada data sewa aktif di grup ini (tidak ada paketSewa atau status bukan aktif)
    if (!dataSewa || !dataSewa.paketSewa || dataSewa.status !== 'aktif') {
        return conn.reply(m.chat, `❌ *Grup ini tidak memiliki paket sewa aktif.*\n\nSilakan hubungi owner untuk menyewa bot.`, m);
    }

    // Ambil informasi dari data sewa (dari struktur addsewa)
    let { idSewa, namaPaket, mulaiSewa, kadaluarsa } = dataSewa;

    // Format tanggal
    let start = new Date(mulaiSewa).toLocaleDateString('id-ID');
    let end = new Date(kadaluarsa).toLocaleDateString('id-ID');
    let sisaHari = Math.max(0, Math.floor((kadaluarsa - Date.now()) / (1000 * 60 * 60 * 24)));

    // Mapping nama paket dari kode (opsional, jika ingin ditampilkan lebih rinci, tapi namaPaket sudah ada)
    // let namaPaketDisplay = {
    //     '0': '🆓 Free Trial',
    //     '1': '📦 Paket 1 Bulan',
    //     '2': '💼 Paket 2 Bulan',
    //     '3': '🏆 Paket 3 Bulan'
    // }[paketSewa] || '📦 Paket Tidak Dikenal';

    let caption = `
┌───「 📊 𝗦𝗧𝗔𝗧𝗨𝗦 𝗦𝗘𝗪𝗔 」
│
│ • 🏷️ *Paket:* ${namaPaket}
│ • 📅 *Aktif Sejak:* ${start}
│ • 📆 *Berakhir Pada:* ${end}
│ • ⏳ *Sisa Waktu:* ${sisaHari > 0 ? `${sisaHari} hari` : 'Sudah kadaluarsa'}
│ • 👤 *Diaktifkan oleh:* @${idSewa?.split('@')[0] || 'Tidak diketahui'}
│
│ Jika kamu ingin memperpanjang atau info lebih lanjut,
│ hubungi owner: ${usedPrefix}owner
│
└───────────────────
`.trim();

    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            mentionedJid: idSewa ? [idSewa] : [], // Cek apakah idSewa ada sebelum disertakan
            externalAdReply: {
                title: `⏰ Status Sewa: ${namaPaket}`,
                body: `Berakhir dalam ${sisaHari} hari`,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: 'https://telegra.ph/file/3a34bfa58714bdef500d9.jpg  ', // Tambahkan spasi jika perlu
                sourceUrl: 'https://wa.me/6285185032092  ' // Tambahkan spasi jika perlu
            }
        }
    });
};

handler.help = ['ceksewa'];
handler.tags = ['group'];
handler.command = /^(ceksewa|statussewa|sewacek)$/i;
handler.group = true;
handler.admin = false; // Bisa diakses semua anggota grup

module.exports = handler;