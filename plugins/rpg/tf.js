// File: transfer.js
// tq: hafizdexe

let handler = async (m, { conn, args, usedPrefix, DevMode }) => {
    
    // --- KONFIGURASI ---
    const MAX_TRANSFER_QTY = 10000; // Batas maksimum transfer
    const ITEM_MAP = {
        // [Key di DB]: { label: 'Label Tampilan', emoji: 'Emote' }
        'money':     { label: 'Money', emoji: '💰' },
        'limit':     { label: 'Limit', emoji: '🏷️' },
        'atm':       { label: 'Tabungan', emoji: '💳' }, // atm digunakan untuk 'tabungan'
        'potion':    { label: 'Potion', emoji: '🥤' },
        'sampah':    { label: 'Sampah', emoji: '🗑️' },
        'diamond':   { label: 'Diamond', emoji: '💎' },
        'common':    { label: 'Common Crate', emoji: '📦' },
        'uncommon':  { label: 'Uncommon Crate', emoji: '🛍️' },
        'mythic':    { label: 'Mythic Crate', emoji: '🎁' },
        'legendary': { label: 'Legendary Crate', emoji: '🧰' },
        'string':    { label: 'String', emoji: '🕸️' },
        'kayu':      { label: 'Kayu', emoji: '🪵' },
        'batu':      { label: 'Batu', emoji: '🪨' },
        'iron':      { label: 'Iron', emoji: '⛓️' },
    };
    
    // Membuat daftar item untuk pesan bantuan
    const itemHelpList = Object.keys(ITEM_MAP).map(key => 
        ` ${ITEM_MAP[key].emoji} ${ITEM_MAP[key].label} (${key})`
    ).join('\n');


    // --- 1. Validasi Argumen Awal ---
    if (args.length < 3) {
        let helpText = `
*${usedPrefix}transfer <type> <jumlah> <@tag>*

*Contoh Penggunaan:*
📍 *${usedPrefix}transfer money 500 @tag*
📍 *${usedPrefix}transfer limit 10 @tag*

*✨ LIST ITEM YANG BISA DI TRANSFER:*
${itemHelpList}
`.trim();
        return conn.reply(m.chat, helpText, m);
    }
    
    try {
        let type = (args[0] || '').toLowerCase();
        let itemInfo = ITEM_MAP[type];
        
        // Cek apakah 'type' valid
        if (!itemInfo) {
             return conn.reply(m.chat, `❌ Tipe transfer *${args[0]}* tidak valid. \n\nKetik *${usedPrefix}transfer* untuk melihat daftar item.`, m);
        }

        let count = args[1] && args[1].length > 0 ? Math.floor(parseInt(args[1])) : 0;
        
        // Validasi Jumlah
        if (isNaN(count) || count < 1) {
            return conn.reply(m.chat, 'Jumlah transfer harus berupa angka positif (minimal 1).', m);
        }
        
        // Menerapkan Batas Maksimum Transfer
        if (count > MAX_TRANSFER_QTY) {
            return conn.reply(m.chat, `⚠️ Jumlah maksimum transfer untuk satu kali transaksi adalah *${MAX_TRANSFER_QTY.toLocaleString()}*.`, m);
        }
        
        // Menentukan penerima (Who)
        let who = m.mentionedJid ? m.mentionedJid[0] : (args[2].replace(/[@ .+-]/g, '').replace(' ', '') + '@s.whatsapp.net');
        
        // Validasi Tag/Nomor Penerima
        if (!m.mentionedJid || !args[2] || !global.db.data.users[who]) {
            throw 'Tag salah satu pengguna, atau ketik Nomernya yang terdaftar di database bot!';
        }
        
        // Validasi Pengirim (tidak bisa transfer ke diri sendiri)
        if (who === m.sender) {
            return conn.reply(m.chat, 'Anda tidak bisa mentransfer item ke diri sendiri!', m);
        }
        
        let users = global.db.data.users;
        let senderData = users[m.sender];
        let receiverData = users[who];
        
        // Gunakan properti yang sesuai, 'atm' untuk tabungan
        const itemKey = (type === 'tabungan') ? 'atm' : type;
        
        // --- 2. Validasi Saldo Pengirim ---
        // Jika data pengirim atau itemKey tidak ada, asumsikan 0
        if ((senderData[itemKey] || 0) < count) {
            return conn.reply(m.chat, 
                `❌ *GAGAL TRANSFER*\n\n${itemInfo.emoji} *${itemInfo.label}* Anda (${(senderData[itemKey] || 0).toLocaleString()}) tidak cukup untuk mentransfer *${count.toLocaleString()}*`, m);
        }

        // --- 3. Proses Transaksi ---
        
        // Pastikan receiverData memiliki properti itemKey, jika tidak, inisialisasi
        if (receiverData[itemKey] === undefined) {
            receiverData[itemKey] = 0;
        }

        senderData[itemKey] -= count;
        receiverData[itemKey] += count;

        let successMsg = `
✅ *TRANSAKSI BERHASIL!*

─────────────────────
▸ Pengirim: *@${m.sender.split('@')[0]}*
▸ Penerima: *@${who.split('@')[0]}*
▸ Item: ${itemInfo.emoji} *${itemInfo.label}*
▸ Jumlah: *${count.toLocaleString()}*
─────────────────────

*Sisa Saldo Anda (${itemInfo.label}):* ${(senderData[itemKey] || 0).toLocaleString()}
        `.trim();

        // Kirim pesan sukses
        conn.reply(m.chat, successMsg, m, { contextInfo: { mentionedJid: [m.sender, who] } });
        
        // Opsional: Kirim notifikasi ke penerima di private chat
        conn.reply(who, `🎁 Anda menerima transfer ${itemInfo.emoji} *${itemInfo.label}* sebanyak *${count.toLocaleString()}* dari *@${m.sender.split('@')[0]}*`, null, { contextInfo: { mentionedJid: [m.sender] } }).catch(e => console.log('Gagal kirim notif ke penerima: ' + e));

    } catch (e) {
        // Penanganan Error Umum dan Pesan Bantuan
        console.error(e);
        let errorMsg = typeof e === 'string' ? e : 'Terjadi kesalahan saat memproses transfer. Pastikan penerima terdaftar dan format sudah benar!';
        
        conn.reply(m.chat, `⚠️ *TRANSFER GAGAL!* ⚠️\n\n${errorMsg}`, m);

        // Notifikasi DevMode
        if (DevMode) {
            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                conn.reply(jid, `Transfer.js error\nNo: *${m.sender.split`@`[0]}*\nCommand: *${m.text}*\n\n*${e}*`, m);
            }
        }
    }
}
    
handler.help = ['transfer <type> <jumlah> <@tag>']
handler.tags = ['rpg', 'economy'] // Tambahkan economy
handler.command = /^(transfer|tf)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = true
handler.private = false
handler.rpg = true
handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.money = 0 // Pastikan fitur ini tidak memerlukan money dari bot itu sendiri

module.exports = handler;