// File: buylimit.js
let handler = async (m, { conn, usedPrefix, text }) => {
    // --- KONFIGURASI HARGA BOT ---
    // Gunakan konfigurasi ini untuk kustomisasi yang mudah
    const HARGA_PER_LIMIT = 0.6; // Harga per limit
    const MIN_HARGA_RP = 3000;  // Minimal harga order (Rp 3.000)
    const MIN_LIMIT_QTY = 5000; // Jumlah limit yang didapat untuk harga minimal

    const OWNER_JID = '6285185032092'; // Nomor Owner/Admin
    const OWNER_LINK = `wa.me/${OWNER_JID}`;

    // --- Mode 1: Order Limit Kustom (dengan argumen angka) ---
    if (text) {
        let jumlahLimit = parseInt(text.replace(/[^0-9]/g, '')) // Bersihkan input dari non-angka
        
        // Validasi Angka
        if (isNaN(jumlahLimit) || jumlahLimit < 1) {
            return conn.reply(m.chat, `❌ Format tidak valid! Masukkan angka saja.\nContoh: *${usedPrefix}buylimit 15000*`, m)
        }
        
        let totalHarga = jumlahLimit * HARGA_PER_LIMIT;
        let finalHarga = Math.round(totalHarga); // Bulatkan ke bilangan bulat terdekat

        // Logika Harga Minimal: Jika total harga < MIN_HARGA_RP
        if (finalHarga < MIN_HARGA_RP) {
            finalHarga = MIN_HARGA_RP;
            jumlahLimit = MIN_LIMIT_QTY; // Tetapkan ke jumlah limit minimal (5.000)
        }

        let textCustom = `
👑 *━━━ ORDER LIMIT CUSTOM ━━━* 👑

✨ *DETAIL ORDER ANDA:*
─────────────────────
▸ 🎯 Jumlah Limit: *${jumlahLimit.toLocaleString('id-ID')} Limit*
▸ 💸 Harga per Limit: *Rp ${HARGA_PER_LIMIT}*
▸ 💰 Total Harga: *Rp ${finalHarga.toLocaleString('id-ID')}*
─────────────────────

💡 *CATATAN PENTING:*
Minimal order adalah *Rp ${MIN_HARGA_RP.toLocaleString('id-ID')}*, setara dengan *${MIN_LIMIT_QTY.toLocaleString('id-ID')} Limit*.

💳 *METODE PEMBAYARAN:*
• Dana | Gopay | QRIS | OVO | ShopeePay

🛒 *CARA ORDER:*
1. Lakukan transfer sebesar *Rp ${finalHarga.toLocaleString('id-ID')}* ke metode pembayaran yang tersedia.
2. Konfirmasi bukti transfer (screenshot) ke Owner/Admin.
3. Limit akan segera ditambahkan ke akun Anda!

📞 *HUBUNGI OWNER SEKARANG:*
${OWNER_LINK}

_Silahkan hubungi owner untuk mendapatkan nomor tujuan transfer dan proses lebih lanjut._
`.trim()

        return conn.reply(m.chat, textCustom, m)
    }

    // --- Mode 2: List Harga Normal (tanpa argumen) ---
    let textList = `
✨ *━━━ PROMO LIMIT MURAH! ━━━* ✨

🔥 *Harga Fantastis: Hanya Rp ${HARGA_PER_LIMIT} per Limit!* 🔥

╭────────────────
│   💰 *LIST HARGA PROMO*
╰────────────────

┌─ *PAKET REGULER*
│ 5.000 Limit » Rp 3.000
│ 10.000 Limit » Rp 6.000
│ 25.000 Limit » Rp 15.000
│ 50.000 Limit » Rp 30.000
│ 100.000 Limit » Rp 60.000
└────────────

🎁 *KEUNTUNGAN SPESIAL:*
• Setiap pembelian mendapatkan *BONUS 10%* tambahan limit.
• Limit dijamin *tidak akan hangus* (Lifetime).
• Kecepatan akses bot *prioritas*.

⚡ *ORDER CUSTOM:*
Ketik *${usedPrefix}buylimit <jumlah limit>*
Contoh: *${usedPrefix}buylimit 15000* (Maka harga akan dihitung otomatis)

💳 *PEMBAYARAN:*
• Dana | Gopay | QRIS | OVO | ShopeePay

📞 *HUBUNGI OWNER:*
${OWNER_LINK}

💡 *INFO:* Minimal order Rp ${MIN_HARGA_RP.toLocaleString('id-ID')} (5.000 Limit).
`.trim()

    conn.reply(m.chat, textList, m)
}

handler.help = ['buylimit <jumlah>', 'hargalimit']
handler.tags = ['payment', 'owner']
handler.command = /^(buylimit|hargalimit|limitprice|belilimit)$/i
handler.limit = false // Agar fitur ini tidak mengurangi limit pengguna

module.exports = handler