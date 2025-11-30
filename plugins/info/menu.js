const { 
    BufferJSON, 
    WA_DEFAULT_EPHEMERAL, 
    generateWAMessageFromContent, 
    proto, 
    generateWAMessageContent, 
    generateWAMessage, 
    prepareWAMessageMedia, 
    areJidsSameUser, 
    getContentType 
} = require('@adiwajshing/baileys');

process.env.TZ = 'Asia/Jakarta';
let fs = require('fs');
let path = require('path');
let moment = require('moment-timezone');

let handler = async (m, { conn, usedPrefix: _p, args, command, isOwner }) => {
    try {
        // 1. DATA USER & SYSTEM
        let user = global.db.data.users[m.sender];
        let name = conn.getName(m.sender);
        let text = args[0]?.toLowerCase() || '';
        
        let uptime = clockString(process.uptime() * 1000);
        let date = moment().tz('Asia/Jakarta').format('DD MMM YYYY');
        let time = moment().tz('Asia/Jakarta').format('HH:mm:ss');

        // Status Indikator
        let status = {
            premium: user.premium ? "✅ Premium" : "❌ Free",
            limit: user.limit,
            money: user.money.toLocaleString(),
            level: user.level
        };

        // 2. KATEGORI MENU (Mapping)
        // Format: 'Nama Tampilan': 'tag_plugin'
        const menuCategories = {
            '🌟 PREMIUM': 'premium',
            '📥 DOWNLOADER': 'downloader',
            '🤖 AI & GPT': 'ai',
            '🛠️ TOOLS': 'tools',
            '🎮 GAME RPG': 'rpg',
            '🕹️ GAME SERU': 'game',
            '👥 GROUP': 'group',
            '🎨 STICKER & MAKER': 'sticker',
            '🎧 VOICE CHANGER': 'voice',
            '☪️ ISLAMIC': 'islamic',
            '💻 INTERNET': 'internet',
            '👑 OWNER': 'owner',
            'ℹ️ INFO': 'info',
            '📂 ALL MENU': 'all'
        };

        // --- TAMPILAN DASHBOARD (MENU UTAMA) ---
        if (!text) {
            let menuText = `
┏━━━━━━━━━━━━━━━━━━━
┃ 🤖 *BOT DASHBOARD*
┗━━━━━━━━━━━━━━━━━━━
👋 Hai, *${name}*

📅 *Date:* ${date}
⏰ *Time:* ${time}
⏳ *Uptime:* ${uptime}

📊 *STATUS USER*
├ 🏷️ Status: ${status.premium}
├ 🎫 Limit: ${status.limit}
├ 💰 Money: Rp ${status.money}
└ 🏆 Level: ${status.level}

📂 *DAFTAR MENU*
Gunakan command di bawah ini:
`;
            // Loop Kategori
            let categories = Object.keys(menuCategories);
            for (let val of categories) {
                // Formatting Text biar rapi
                menuText += `\n➤ *${_p}menu ${menuCategories[val]}* (${val})`;
            }

            menuText += `\n\n_Bot by Shanove_`;

            return sendStylishMenu(m, conn, menuText);
        }

        // --- TAMPILAN SUB-MENU (LIST COMMAND) ---
        let targetTag = text;
        let resultText = `
┏━━━━━━━━━━━━━━━━━━━
┃ 📂 *MENU: ${targetTag.toUpperCase()}*
┗━━━━━━━━━━━━━━━━━━━
`;
        
        // Mengambil semua plugin
        let plugins = Object.values(global.plugins).filter(plugin => !plugin.disabled);
        let commands = [];

        // Logic Filter
        if (targetTag === 'all') {
            commands = plugins; // Ambil semua
        } else if (targetTag === 'premium') {
             // Khusus premium ambil yg flag premium: true
             commands = plugins.filter(p => p.premium);
        } else {
             // Filter berdasarkan tags
             commands = plugins.filter(p => p.tags && p.tags.includes(targetTag));
        }

        // Jika tidak ada command ditemukan
        if (commands.length === 0) {
            return m.reply(`❌ Kategori *${targetTag}* tidak ditemukan atau kosong.\nKetik *${_p}menu* untuk melihat daftar kategori.`);
        }

        // Sorting & Formatting
        // Sort abjad A-Z
        commands.sort((a, b) => {
            let helpA = Array.isArray(a.help) ? a.help[0] : a.help;
            let helpB = Array.isArray(b.help) ? b.help[0] : b.help;
            return (helpA || '').localeCompare(helpB || '');
        });

        let listCmd = commands.map(cmd => {
            let help = Array.isArray(cmd.help) ? cmd.help[0] : cmd.help;
            if (!help) return null;
            
            // Tambahkan badge
            let badge = '';
            if (cmd.premium) badge += ' 🅟';
            if (cmd.limit) badge += ' 🅛';
            
            return `│ ◦ ${_p}${help}${badge}`;
        }).filter(Boolean).join('\n');

        resultText += listCmd;
        resultText += `\n\n└ 💡 *Total:* ${commands.length} Command`;

        return sendStylishMenu(m, conn, resultText);

    } catch (e) {
        console.error(e);
        m.reply('❌ Terjadi kesalahan saat memuat menu.');
    }
};

handler.help = ['menu', 'help'];
handler.tags = ['main'];
handler.command = /^(menu|help|list)$/i;

module.exports = handler;

// --- FUNGSI TAMPILAN KEREN (AD-REPLY) ---
async function sendStylishMenu(m, conn, text) {
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/a2ae6cbfa40f6eeea0cf1.jpg');
    
    // Ganti URL thumbnail di bawah dengan gambar bot kamu
    let thumbUrl = 'https://telegra.ph/file/5a543e7436034a780824b.jpg'; 

    await conn.sendMessage(m.chat, {
        text: text,
        contextInfo: {
            externalAdReply: {
                title: "Shanove Bot - WhatsApp Assistant",
                body: "Klik di sini untuk sewa bot",
                thumbnailUrl: thumbUrl,
                sourceUrl: "https://wa.me/6285185032092", // Ganti nomor owner
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}

// --- FUNGSI TIMER ---
function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}