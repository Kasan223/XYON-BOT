// File: sewa.js

// --- KONSTANTA GLOBAL ---
const OWNER_CONTACT = '6285185032092';
const THUMBNAIL_URL = 'https://telegra.ph/file/3a34bfa58714bdef500d9.jpg';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    
    // SISTEM SEWA 1 GRUP DENGAN DURASI FLEKSIBEL
    const BASE_PRICE = 15000; // Harga dasar 1 bulan
    
    let packages = {
        '1': {
            name: '✨ PAKET BRONZE',
            duration: 30, 
            price: 15000,
            savings: 0, 
            features: [
                'Bot masuk ke 1 Grup',
                'Semua Fitur Basic Unlocked',
                'Support 24/7',
                'Auto Welcome & Goodbye',
                'Anti Link Group'
            ],
            bestFor: 'Cocok untuk trial atau event jangka pendek'
        },
        '2': {
            name: '⭐ PAKET SILVER (Best Value)',
            duration: 60,
            price: 25000,
            savings: 5000, // Hemat 5000 dari 30000
            features: [
                'Bot masuk ke 1 Grup',
                'Semua Fitur PREMIUM Unlocked',
                'Priority Support & Update',
                'Custom Command (1 Command)',
                'Anti Spam & Flood Canggih',
                'Dashboard Monitoring'
            ],
            bestFor: 'Grup bisnis, online shop, komunitas medium'
        },
        '3': {
            name: '🏆 PAKET GOLD (Paling Hemat)',
            duration: 90,
            price: 35000,
            savings: 10000, // Hemat 10000 dari 45000
            features: [
                'Bot masuk ke 1 Grup',
                'ALL Features Unlocked',
                'VIP Support (Respon <5 Menit)',
                'Custom Command (3 Commands)',
                'White Label Bot (Nama Custom)',
                'Request Fitur Custom'
            ],
            bestFor: 'Grup enterprise, bisnis established, large community'
        }
    };

    // --- LOGIKA UTAMA ---

    // JIKA USER MEMILIH PAKET SPESIFIK
    if (text && packages[text]) {
        let pkg = packages[text];
        
        // Teks penghematan, hanya ditampilkan jika ada penghematan
        let savingsText = pkg.savings > 0 ? 
            `\n💸 *Anda Hemat:* Rp ${pkg.savings.toLocaleString('id-ID')} (vs. harga bulanan)` : 
            '';

        let packageDetail = `
*╭━━━[ DETAIL ${pkg.name.toUpperCase()} ]━━━*
*┃*
*┃* ⏰ *Durasi:* ${pkg.duration} Hari
*┃* 💰 *Harga:* Rp ${pkg.price.toLocaleString('id-ID')}
*┃* 📊 *Untuk:* 1 Grup WhatsApp
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 🎁 *FITUR TERMASUK*
${pkg.features.map(feature => `*┃* ╰ ✅ ${feature}`).join('\n')}
*┃*
*┃* 🎯 *Rekomendasi:* ${pkg.bestFor}
*┃* ${savingsText}
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 📞 *CARA ORDER & PEMBAYARAN*
*┃*
*┃* 📲 *KONFIRMASI OWNER:* wa.me/${OWNER_CONTACT}
*┃*
*┃* *Metode Transfer:*
*┃* ╰ DANA: 0851-8503-2092
*┃* ╰ GOPAY: 0851-8212-8985
*┃* ╰ PULSA (XL): 0877-6751-0608
*┃*
*┃* 🚀 *Aktivasi:* 1-6 Jam (Prioritas)
*╰━━━━━━━━━━━━━━━━━━━━*
        `.trim();

        await conn.sendMessage(m.chat, { 
            text: packageDetail,
            contextInfo: {
                externalAdReply: {
                    title: `⏰ ${pkg.duration} Hari - Rp ${pkg.price.toLocaleString('id-ID')}`,
                    body: `Sewa Bot 1 Grup • ${pkg.name}`,
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: THUMBNAIL_URL,
                    sourceUrl: `https://wa.me/${OWNER_CONTACT}`
                }
            }
        });
        return;
    }

    // --- TAMPILAN UTAMA - LIST SEMUA PAKET ---
    let sewaMessage = `
*╭━━━[ 👑 LAYANAN SEWA BOT ]━━━*
*┃*
*┃* 🎯 *Sewa Bot untuk 1 Grup WhatsApp*
*┃* 💰 *Mulai dari Rp ${BASE_PRICE.toLocaleString('id-ID')} per bulan!*
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 📋 *PILIH PAKET DURASI*
*┃*
*┃* 1️⃣ ${packages['1'].name}
*┃* ╰ ⏰ ${packages['1'].duration} Hari | 💰 *Rp ${packages['1'].price.toLocaleString('id-ID')}*
*┃* ╰ *${usedPrefix}sewa 1*
*┃*
*┃* 2️⃣ ${packages['2'].name}
*┃* ╰ ⏰ ${packages['2'].duration} Hari | 💰 *Rp ${packages['2'].price.toLocaleString('id-ID')}*
*┃* ╰ 💸 Hemat *Rp ${packages['2'].savings.toLocaleString('id-ID')}*!
*┃* ╰ *${usedPrefix}sewa 2*
*┃*
*┃* 3️⃣ ${packages['3'].name}
*┃* ╰ ⏰ ${packages['3'].duration} Hari | 💰 *Rp ${packages['3'].price.toLocaleString('id-ID')}*
*┃* ╰ 💸 Hemat *Rp ${packages['3'].savings.toLocaleString('id-ID')}*!
*┃* ╰ *${usedPrefix}sewa 3*
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 💳 *PEMBAYARAN & KONFIRMASI*
*┃*
*┃* 📲 *KONFIRMASI OWNER:* wa.me/${OWNER_CONTACT}
*┃*
*┃* *Metode Transfer:*
*┃* ╰ DANA: 0851-8503-2092
*┃* ╰ GOPAY: 0851-8212-8985
*┃* ╰ PULSA (XL): 0877-6751-0608
*┃*
*╰━━━━━━━━━━━━━━━━━━━━*
*💡 Tips:* Paket 2 & 3 *JAUH LEBIH HEMAT* untuk penggunaan jangka panjang!
    `.trim();

    await conn.sendMessage(m.chat, { 
        text: sewaMessage,
        contextInfo: {
            externalAdReply: {
                title: `💰 Sewa Bot - Hemat Sampai 22%`,
                body: `Pilihan 1-3 Bulan • Mulai Rp ${BASE_PRICE.toLocaleString('id-ID')}`,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: THUMBNAIL_URL,
                sourceUrl: `https://wa.me/${OWNER_CONTACT}`
            }
        }
    });
};

handler.help = ['sewa', 'sewabot'];
handler.tags = ['main', 'owner'];
handler.command = /^(sewa|sewabot|rentbot)$/i;
handler.group = false; // Membiarkan fitur ini bisa digunakan di luar grup (di chat pribadi)

module.exports = handler;