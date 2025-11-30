// File: buypremium.js (Integrasi Custom Order Harga Rp 350/Hari)

// --- KONSTANTA GLOBAL ---
const OWNER_CONTACT = '6285185032092';
const THUMBNAIL_URL = 'https://telegra.ph/file/3a34bfa58714bdef500d9.jpg';
const BASE_PRICE = 13000; // Harga dasar per bulan
const HARGA_PER_HARI_CUSTOM = 350; // HARGA BARU: Rp 350 per hari untuk order custom
const MIN_HARI_CUSTOM = 7; // Minimal order custom

let handler = async (m, { conn, usedPrefix, command, text }) => {
    
    // SISTEM HARGA PREMIUM UNTUK 1 USER
    let packages = {
        '1': {
            name: '🌟 PREMIUM SILVER', duration: 30, 
            price: 13000, savings: 0, 
            features: [
                'Akses ⚡ Fitur Cepat (Premium Only)', 'Limit *Tak Terbatas*', 
                'Akses Penuh Fitur AI (tanpa kuota)', 'Anti Spam Protection Level 2', 
                'Status Premium Badge'
            ],
            bestFor: 'Cocok untuk penggunaan pribadi, harian/mingguan.'
        },
        '2': {
            name: '⭐ PREMIUM GOLD (Best Value)', duration: 60,
            price: 25500, // Harga jual
            savings: (2 * BASE_PRICE) - 25500, // (26.000 - 25.500) = 500
            features: [
                'Semua Fitur Silver', 'Priority Processing Queue', 
                'Custom Command Personal (1 Command)', 'Akses ke Fitur Eksperimental (Beta)', 
                'Prioritas Support & Bugfix'
            ],
            bestFor: 'Pengguna aktif yang membutuhkan kecepatan dan fitur lengkap.'
        },
        '3': {
            name: '🏆 PREMIUM PLATINUM (Maksimal)', duration: 90,
            price: 35100, // HARGA JUAL (Diskon 10%)
            savings: (3 * BASE_PRICE) - 35100, // (39.000 - 35.100) = 3.900
            features: [
                'Semua Fitur Gold', 'Limit *Tak Terbatas* (Lifetime)', 
                'White Label Command (Prefix custom)', 'Request Fitur Custom Personal (1x)', 
                'VIP Support (Respon Cepat)'
            ],
            bestFor: 'Developer, pemilik bisnis, atau pengguna dengan volume tinggi.'
        }
    };
    
    // Diskon tertinggi 10%
    const HIGHEST_DISCOUNT_PERCENT = 10; 

    // --- LOGIKA UTAMA ---

    if (text) {
        let inputNum = parseInt(text);

        // --- Mode 2 & 3: PAKET TETAP (1, 2, 3) ---
        if (packages[inputNum]) {
            let pkg = packages[inputNum];
            
            let savingsText = pkg.savings > 0 ? 
                `\n💸 *Anda Hemat:* Rp ${pkg.savings.toLocaleString('id-ID')} (vs. harga bulanan)` : 
                '';

            let packageDetail = `
*╭━━━[ DETAIL ${pkg.name.toUpperCase()} ]━━━*
*┃*
*┃* ⏰ *Durasi:* ${pkg.duration} Hari
*┃* 💰 *Harga:* Rp ${pkg.price.toLocaleString('id-ID')}
*┃* 👤 *Untuk:* 1 Akun Pengguna
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 🎁 *FITUR YANG DIDAPAT*
${pkg.features.map(feature => `*┃* ╰ ✅ ${feature}`).join('\n')}
*┃*
*┃* 🎯 *Rekomendasi:* ${pkg.bestFor}
*┃* ${savingsText}
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 📞 *CARA ORDER & AKTIVASI*
*┃*
*┃* 💳 *Transfer:* Rp ${pkg.price.toLocaleString('id-ID')}
*┃* 📲 *Konfirmasi:* Kirim bukti transfer ke: wa.me/${OWNER_CONTACT}
*┃*
*╰━━━━━━━━━━━━━━━━━━━━*
            `.trim();

            await conn.sendMessage(m.chat, { 
                text: packageDetail,
                contextInfo: {
                    externalAdReply: {
                        title: `👑 ${pkg.duration} Hari - Rp ${pkg.price.toLocaleString('id-ID')}`,
                        body: `Upgrade Akun ke Premium • ${pkg.name}`,
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
        
        // --- Mode 4: ORDER CUSTOM (Angka > 3) ---
        else if (!isNaN(inputNum) && inputNum >= MIN_HARI_CUSTOM) {
            
            let jumlahHari = inputNum;
            // *** KALKULASI HARGA CUSTOM BARU (Rp 350/Hari) ***
            let totalHarga = jumlahHari * HARGA_PER_HARI_CUSTOM;
            // **********************************************
            
            let customDetail = `
*╭━━━[ 📝 ORDER CUSTOM PREMIUM ]━━━*
*┃*
*┃* 🗓️ *Durasi:* *${jumlahHari} Hari*
*┃* 💰 *Harga Satuan:* Rp ${HARGA_PER_HARI_CUSTOM.toLocaleString('id-ID')} / Hari
*┃* 💸 *TOTAL HARGA:* *Rp ${totalHarga.toLocaleString('id-ID')}*
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 📞 *CARA ORDER & AKTIVASI*
*┃*
*┃* 💳 *Metode Transfer:*
*┃* ╰ DANA: 0851-8503-2092
*┃* ╰ GOPAY: 0851-8212-8985
*┃* ╰ PULSA (XL): 0877-6751-0608
*┃*
*┃* 📲 *KONFIRMASI:*
*┃* ╰ Transfer Rp ${totalHarga.toLocaleString('id-ID')}
*┃* ╰ Kirim bukti transfer ke: wa.me/${OWNER_CONTACT}
*┃* 🚀 *Aktivasi:* 1-6 Jam setelah konfirmasi.
*┃*
*╰━━━━━━━━━━━━━━━━━━━━*
*💡 Catatan:* Minimal order custom adalah ${MIN_HARI_CUSTOM} hari.
            `.trim();

            await conn.sendMessage(m.chat, { 
                text: customDetail,
                contextInfo: {
                    externalAdReply: {
                        title: `👑 CUSTOM ORDER: ${jumlahHari} Hari - Rp ${totalHarga.toLocaleString('id-ID')}`,
                        body: `Harga Satuan: Rp ${HARGA_PER_HARI_CUSTOM.toLocaleString('id-ID')}/Hari`,
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
        
        // --- Validasi Error untuk input non-paket & non-angka ---
        else {
             return conn.reply(m.chat, 
                `❌ Format tidak valid! Masukkan angka paket (1/2/3) atau jumlah hari custom (min ${MIN_HARI_CUSTOM}).\n\nContoh:\n*${usedPrefix}buyprem 2* (Paket Gold)\n*${usedPrefix}buyprem 45* (Custom 45 hari)`, m);
        }
    }

    // --- Mode 1: TAMPILAN UTAMA - LIST SEMUA PAKET ---
    
    let user = global.db.data.users[m.sender];
    let isPrem = user.premium ? '✅ Aktif' : '❌ Non-Aktif';
    let expireDate = user.premiumTime ? moment(user.premiumTime).format('DD/MM/YYYY') : 'N/A';
    
    let sewaMessage = `
*╭━━━[ 👑 LAYANAN PREMIUM USER ]━━━*
*┃*
*┃* 👤 *Status Anda:* ${isPrem}
*┃* ⏰ *Kadaluarsa:* ${expireDate}
*┃* 💰 *HARGA MAKIN MURAH!* Mulai dari *Rp ${BASE_PRICE.toLocaleString('id-ID')}* per bulan!
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 📋 *PILIH PAKET UPGRADE*
*┃*
*┃* 1️⃣ ${packages['1'].name}
*┃* ╰ ⏰ ${packages['1'].duration} Hari | 💰 *Rp ${packages['1'].price.toLocaleString('id-ID')}*
*┃* ╰ *${usedPrefix}buyprem 1*
*┃*
*┃* 2️⃣ ${packages['2'].name}
*┃* ╰ ⏰ ${packages['2'].duration} Hari | 💰 *Rp ${packages['2'].price.toLocaleString('id-ID')}*
*┃* ╰ 💸 Hemat *Rp ${packages['2'].savings.toLocaleString('id-ID')}*!
*┃* ╰ *${usedPrefix}buyprem 2*
*┃*
*┃* 3️⃣ ${packages['3'].name}
*┃* ╰ ⏰ ${packages['3'].duration} Hari | 💰 *Rp ${packages['3'].price.toLocaleString('id-ID')}*
*┃* ╰ 🌟 DISKON ${HIGHEST_DISCOUNT_PERCENT}%! Hemat *Rp ${packages['3'].savings.toLocaleString('id-ID')}*!
*┃* ╰ *${usedPrefix}buyprem 3*
*┃*
*┣━━━━━━━━━━━━━━━━━━━━*
*┃* 📝 *ORDER CUSTOM*
*┃* ╰ Harga: *Rp ${HARGA_PER_HARI_CUSTOM.toLocaleString('id-ID')}* / Hari (Min ${MIN_HARI_CUSTOM} Hari)
*┃* ╰ *${usedPrefix}buyprem <jumlah hari>*
*┃* ╰ Contoh: *${usedPrefix}buyprem 45*
*┃*
*╰━━━━━━━━━━━━━━━━━━━━*
*💡 Tips:* Dapatkan *DISKON ${HIGHEST_DISCOUNT_PERCENT}%* dengan memilih Paket Platinum (90 Hari)!
    `.trim();

    await conn.sendMessage(m.chat, { 
        text: sewaMessage,
        contextInfo: {
            externalAdReply: {
                title: `👑 Upgrade Premium • DISKON ${HIGHEST_DISCOUNT_PERCENT}%`,
                body: `Harga Turun Lagi! Mulai Rp ${BASE_PRICE.toLocaleString('id-ID')} • Custom Hanya Rp ${HARGA_PER_HARI_CUSTOM.toLocaleString('id-ID')}/Hari`,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: THUMBNAIL_URL,
                sourceUrl: `https://wa.me/${OWNER_CONTACT}`
            }
        }
    });
};

handler.help = ['buyprem <paket|hari>', 'hargaprem'];
handler.tags = ['main', 'premium'];
handler.command = /^(buyprem|hargaprem|buypremium|upgrade)$/i;
handler.register = true;

module.exports = handler;