// Nama file: addsewa.js
// Letakkan file ini di folder handlers/command/ atau sesuaikan dengan struktur project kamu

let handler = async (m, { conn, command, usedPrefix, text, isOwner }) => {
    // Pastikan hanya owner yang bisa menggunakan command ini
    if (!isOwner) {
        await conn.reply(m.chat, '❌ Perintah ini hanya untuk Owner!', m)
        return
    }

    // Ambil data pengguna dan chat
    let user = global.db.data.users[m.sender]

    // Pisahkan input text menjadi ID Grup dan Nomor Paket
    let [chatId, packageNumber] = text.split(' ')

    // Validasi input
    if (!chatId || !packageNumber) {
        await conn.reply(m.chat, `❌ Format salah!\n\nGunakan: *${usedPrefix + command}* <id_grup> <nomor_paket>\nContoh: *${usedPrefix + command}* 123456789012345678@g.us 2\nContoh Trial: *${usedPrefix + command}* 123456789012345678@g.us 0`, m)
        return
    }

    // Pastikan ID Grup valid (mengandung @g.us)
    if (!chatId.endsWith('@g.us')) {
        await conn.reply(m.chat, `❌ ID Grup tidak valid. Harus diakhiri dengan "@g.us".\nContoh: 123456789012345678@g.us`, m)
        return
    }

    // Ambil data paket dari database kamu, tambahkan paket trial
    let packages = {
        '0': { // Paket Trial
            name: '🆓 FREE TRIAL',
            duration: 5 * 24 * 60 * 60 * 1000, // Durasi dalam milidetik (5 hari)
            price: 0, // Harga gratis
            benefit: 'Coba dulu fitur-fitur utama bot!',
            bestFor: 'User yang ingin mencoba sebelum sewa'
        },
        '1': {
            name: '📦 PAKET 1 BULAN',
            duration: 30 * 24 * 60 * 60 * 1000, // Durasi dalam milidetik (30 hari)
            price: 15000,
            benefit: 'Cocok untuk trial atau event jangka pendek',
            bestFor: 'Grup temporary, event, komunitas kecil'
        },
        '2': {
            name: '💼 PAKET 2 BULAN',
            duration: 60 * 24 * 60 * 60 * 1000, // Durasi dalam milidetik (60 hari)
            price: 25000,
            benefit: 'Hemat 17% dibanding bulanan - Best Value!',
            bestFor: 'Grup bisnis, online shop, komunitas medium'
        },
        '3': {
            name: '🏆 PAKET 3 BULAN',
            duration: 90 * 24 * 60 * 60 * 1000, // Durasi dalam milidetik (90 hari)
            price: 35000,
            benefit: 'Hemat 22% - Paling ekonomis untuk jangka panjang!',
            bestFor: 'Grup enterprise, bisnis established, large community'
        }
    };

    // Pastikan nomor paket valid (0, 1, 2, atau 3)
    if (!['0', '1', '2', '3'].includes(packageNumber)) {
        await conn.reply(m.chat, `❌ Nomor paket tidak valid. Gunakan 0, 1, 2, atau 3.\n\nPaket Sewa:\n0 - Trial 5 Hari (Gratis)\n1 - 30 Hari (Rp 15.000)\n2 - 60 Hari (Rp 25.000)\n3 - 90 Hari (Rp 35.000)`, m)
        return
    }

    let selectedPackage = packages[packageNumber];

    // Ambil atau buat entri chat di database
    if (!global.db.data.chats[chatId]) {
        global.db.data.chats[chatId] = {} // Buat objek kosong jika belum ada
    }

    let targetChat = global.db.data.chats[chatId];

    // Atur informasi sewa
    let now = new Date().getTime(); // Waktu sekarang dalam milidetik
    targetChat.jid = chatId; // Simpan JID grup
    // Coba ambil nama grup, jika gagal gunakan default
    let groupMetadata = await conn.groupMetadata(chatId).catch(() => ({ subject: 'Unknown Group' }));
    targetChat.namaGrup = groupMetadata.subject || 'Unknown Group';
    targetChat.idSewa = m.sender; // ID owner/wa yang menyetel sewa (opsional, untuk tracking)
    targetChat.paketSewa = packageNumber; // Simpan nomor paket
    targetChat.namaPaket = selectedPackage.name; // Simpan nama paket
    targetChat.mulaiSewa = now; // Tanggal mulai sewa
    targetChat.kadaluarsa = now + selectedPackage.duration; // Tanggal kadaluarsa
    targetChat.status = 'aktif'; // Set status awal sebagai aktif
    // Tandai apakah ini trial agar bisa ditangani khusus nantinya (opsional)
    targetChat.isTrial = (packageNumber === '0');

    // Simpan perubahan ke database (jika perlu, tergantung implementasi global.db.save())
    // global.db.write(); // Uncomment jika kamu menggunakan sistem penyimpanan yang perlu disimpan secara manual

    // Buat pesan konfirmasi yang lebih minimalis dan keren
    let statusEmoji = targetChat.isTrial ? '🆓' : '✅'
    let statusText = targetChat.isTrial ? 'Trial' : 'Sewa'

    let caption = `
${statusEmoji} *${statusText} Berhasil*
${targetChat.namaGrup || chatId}

*Paket:* ${selectedPackage.name}
*Durasi:* ${selectedPackage.duration / (24 * 60 * 60 * 1000)} Hari
*Harga:* Rp ${selectedPackage.price.toLocaleString()}
*Berlaku:* ${new Date(targetChat.mulaiSewa).toLocaleDateString('id-ID')} - ${new Date(targetChat.kadaluarsa).toLocaleDateString('id-ID')}
*Status:* ${targetChat.status}

Bot aktif di grup.
${targetChat.isTrial ? '\n⚠️ Trial akan otomatis keluar setelah 5 hari.' : ''}
`.trim()

    await conn.reply(m.chat, caption, m, { mentions: [m.sender] })

    // Kirim pesan konfirmasi ke grup yang disewa (termasuk trial)
    try {
        await conn.reply(chatId, `🔔 Info Sewa\nBot aktif hingga ${new Date(targetChat.kadaluarsa).toLocaleDateString('id-ID')}.`, null)
    } catch (e) {
        console.log('Gagal mengirim notifikasi ke grup', chatId, e)
        // Jika gagal mengirim ke grup, mungkin karena bot tidak ada di grup atau tidak ada akses
        // Tapi entri di database tetap dibuat
    }

    console.log(`[${targetChat.isTrial ? 'TRIAL' : 'SEWA'}] Grup ${chatId} (${targetChat.namaGrup}) diset oleh ${m.sender} untuk paket ${packageNumber} (${selectedPackage.name}). Kadaluarsa: ${new Date(targetChat.kadaluarsa).toLocaleString()}`)

}

handler.help = ['addsewa <id_grup> <nomor_paket>']
handler.tags = ['owner']
handler.command = /^(addsewa|setsewa)$/i
handler.owner = true // Hanya owner yang bisa pakai

module.exports = handler

// Fungsi untuk memeriksa dan menangani grup yang sewanya sudah kadaluwarsa
// Panggil fungsi ini secara berkala, misalnya di main.js saat bot aktif, atau dengan scheduler
global.checkExpiredSewa = async (conn) => {
    let chats = global.db.data.chats
    let now = new Date().getTime()

    for (let chatId in chats) {
        if (chats[chatId] && chats[chatId].kadaluarsa && chats[chatId].status === 'aktif') {
            if (now >= chats[chatId].kadaluarsa) {
                console.log(`[EXPIRED] Grup ${chatId} (${chats[chatId].namaGrup}) telah kadaluarsa.`)
                try {
                    // Kirim pesan peringatan sebelum keluar (opsional)
                    await conn.reply(chatId, `⏰ Masa aktif bot habis.\nTerima kasih telah menggunakan layanan kami.`, null).catch(() => {}) // Abaikan error jika gagal kirim
                    // Keluarkan bot dari grup
                    await conn.groupLeave(chatId)
                    console.log(`[OUT] Bot telah keluar dari grup ${chatId} karena sewa habis.`)
                } catch (e) {
                    console.error(`Gagal keluar dari grup ${chatId} saat kadaluarsa:`, e)
                }
                // Perbarui status di database
                chats[chatId].status = 'expired';
                chats[chatId].kadaluarsa = null; // Reset kadaluarsa
            }
        }
    }
    // Simpan perubahan ke database (jika perlu)
    // global.db.write(); // Uncomment jika kamu menggunakan sistem penyimpanan yang perlu disimpan secara manual
}

// Contoh cara memanggil fungsi checkExpiredSewa saat bot aktif (letakkan ini di main.js atau file utama bot)
// setInterval(() => global.checkExpiredSewa(conn), 60 * 1000); // Cek setiap 60 detik