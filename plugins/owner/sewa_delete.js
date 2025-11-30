let handler = async (m, { conn, usedPrefix, command, isAdmin, isOwner }) => {
    // Cek apakah pengguna adalah admin atau owner
    if (!isAdmin && !isOwner) {
        return conn.reply(m.chat, `❌ Perintah ini hanya bisa digunakan oleh admin grup atau owner.`, m);
    }

    // Ambil data chats
    let chats = global.db.data.chats || {};

    // Ambil JID grup
    let groupJid = m.chat;

    // Cek apakah ada data sewa untuk grup ini
    if (!chats[groupJid] || !chats[groupJid].paketSewa) {
        return conn.reply(m.chat, `❌ Tidak ada data sewa yang ditemukan untuk grup ini.`, m);
    }

    // Simpan data lama untuk konfirmasi
    let { namaGrup, namaPaket, kadaluarsa } = chats[groupJid];

    // Hapus semua data sewa untuk grup ini
    delete chats[groupJid].paketSewa;
    delete chats[groupJid].namaPaket;
    delete chats[groupJid].mulaiSewa;
    delete chats[groupJid].kadaluarsa;
    delete chats[groupJid].status;
    delete chats[groupJid].idSewa;
    delete chats[groupJid].isTrial;

    // Jika objek menjadi kosong setelah dihapus, hapus seluruh entri
    if (Object.keys(chats[groupJid]).length === 0) {
        delete chats[groupJid];
    }

    // Simpan perubahan ke database
    global.db.data.chats = chats;
    if (global.db && global.db.write) await global.db.write(); // Opsional: simpan ke file jika pakai JSON

    // Kirim konfirmasi
    let caption = `
✅ *Data Sewa Dihapus*

Grup: ${namaGrup || groupJid}
Paket: ${namaPaket || 'Tidak Diketahui'}
Berakhir: ${kadaluarsa ? new Date(kadaluarsa).toLocaleDateString('id-ID') : 'Tidak Diketahui'}

Semua data sewa telah dihapus dari database.
`.trim();

    await conn.reply(m.chat, caption, m);
};

handler.help = ['hapussewa'];
handler.tags = ['owner', 'group'];
handler.command = /^(hapussewa|delsewa|deletesewa)$/i;
handler.group = true;
handler.admin = false; // Hanya admin grup yang bisa menghapus sewa (jika kamu ingin owner bisa akses dari mana saja, ubah ke handler.owner = true)

module.exports = handler;