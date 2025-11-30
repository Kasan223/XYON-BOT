// plugins/antilinkgc_auto_delete.js

let handler = async (m, { conn, text, isBotAdmin, isAdmin, participants, usedPrefix, command }) => {
    // Cek apakah pesan dikirim di grup
    if (!m.isGroup) {
        throw `❌ Perintah ini hanya bisa digunakan di grup!`;
    }

    // Cek apakah bot adalah admin (penting untuk bisa menghapus pesan)
    if (!isBotAdmin) {
        throw `❌ Bot harus menjadi admin untuk menggunakan fitur ini!`;
    }

    // Ambil status antilinkgc dari database
    let chat = global.db.data.chats[m.chat];
    if (typeof chat.antilinkgc === 'undefined') {
        // Jika status belum ada di database, set default ke true (aktif)
        chat.antilinkgc = true;
    }

    // Jika tidak ada argumen teks, tampilkan status
    if (!text) {
        let status = chat.antilinkgc ? '✅ NYALA' : '❌ MATI';
        m.reply(` antis 🚫\nStatus: ${status}\n\nKirim pesan dengan link WA di grup ini dan bot akan otomatis menghapusnya.`);
        return;
    }

    // Jika ada argumen teks, ubah status
    if (/nyala|on|aktif|enable/i.test(text)) {
        if (chat.antilinkgc) return m.reply('✅ Sudah aktif.');
        chat.antilinkgc = true;
        m.reply('✅ Antilink GC sekarang aktif. Bot akan otomatis menghapus pesan yang mengandung link WhatsApp Group.');
    } else if (/mati|off|nonaktif|disable/i.test(text)) {
        if (!chat.antilinkgc) return m.reply('❌ Sudah mati.');
        chat.antilinkgc = false;
        m.reply('❌ Antilink GC sekarang mati.');
    } else {
        m.reply(`❌ Format salah.\n\nGunakan: *${usedPrefix + command}* on\nUntuk mengaktifkan\n\nGunakan: *${usedPrefix + command}* off\nUntuk menonaktifkan`);
    }
};

// Fungsi handler untuk mendeteksi dan menghapus link
handler.before = async (m, { conn, isAdmin, isBotAdmin, participants }) => {
    // Jika bukan pesan grup, abaikan
    if (!m.isGroup) return;

    // Ambil status antilinkgc dari database
    const chat = global.db.data.chats[m.chat];

    // Jika status antilinkgc tidak aktif (undefined atau false), abaikan
    if (!chat?.antilinkgc) return;

    // Jika pesan dikirim oleh admin grup, abaikan
    const senderAdmin = participants.find(u => u.id === m.sender)?.admin;
    if (senderAdmin) return; // Jika pengirim adalah admin, jangan hapus

    // Cek apakah pesan mengandung teks dan mengandung link WA
    if (m.text && /chat.whatsapp.com\/[A-Za-z0-9]/i.test(m.text)) {
        // Jika bot adalah admin, hapus pesan
        if (isBotAdmin) {
            try {
                await conn.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        fromMe: false,
                        id: m.id,
                        participant: m.sender
                    }
                });
                // (Opsional) Kirim pesan pemberitahuan bahwa pesan dihapus
                // await conn.reply(m.chat, `@${m.sender.split('@')[0]} mengirim link grup, pesan telah dihapus.`, m, { mentions: [m.sender] });
            } catch (e) {
                console.error("Gagal menghapus pesan:", e);
                // Jika gagal hapus, bisa kirim pesan error ke owner atau log
            }
        } else {
            // Jika bot bukan admin, tidak bisa hapus pesan
            console.log("Bot bukan admin, tidak bisa menghapus pesan link.");
        }
    }
};

handler.help = ['antilinkgc <on/off>'];
handler.tags = ['group'];
handler.command = /^(antilinkgc|antilinkgroup)$/i;
handler.group = true;
handler.admin = true; // Hanya admin yang bisa mengubah status on/off

module.exports = handler;