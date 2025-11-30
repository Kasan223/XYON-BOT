let handler = async (m, { conn, args }) => {
    try {
        // Jika tidak ada argumen, tampilkan cara penggunaan
        if (!args[0]) {
            return m.reply(`📋 *Cara Menggunakan:*
• ${usedPrefix}getlink <group_id>
• ${usedPrefix}getlink 6281234567890-1623456789@g.us

🔍 *Cara Mendapatkan Group ID:*
1. Invite bot ke group
2. Ketik ${usedPrefix}id
3. Copy ID group yang ditampilkan

📝 *Contoh:*
${usedPrefix}getlink 6281234567890-1623456789@g.us`);
        }

        let groupId = args[0];
        
        // Validasi format group ID
        if (!groupId.endsWith('@g.us')) {
            groupId = groupId + '@g.us';
        }

        // Cek apakah group ID valid
        if (!groupId.match(/\d+-\d+@g\.us/)) {
            return m.reply('❌ *Format Group ID tidak valid!*\nContoh: 6281234567890-1623456789@g.us');
        }

        // Dapatkan info group
        let groupMetadata = await conn.groupMetadata(groupId).catch(() => null);
        
        if (!groupMetadata) {
            return m.reply('❌ *Group tidak ditemukan!*\nPastikan:\n• Bot sudah join group tersebut\n• Group ID benar\n• Bot tidak di kick dari group');
        }

        // Dapatkan invite link
        let inviteCode = await conn.groupInviteCode(groupId).catch(() => null);
        
        if (!inviteCode) {
            return m.reply('❌ *Tidak bisa mendapatkan link!*\nBot mungkin bukan admin di group tersebut.');
        }

        let inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        
        // Buat pesan hasil
        let resultText = `
╭───「 🔗 *GROUP LINK* 」
│
│ ◦ 🏷️ *Nama Group:* ${groupMetadata.subject}
│ ◦ 👥 *Jumlah Member:* ${groupMetadata.participants.length}
│ ◦ 📅 *Dibuat:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString('id-ID')}
│ ◦ 🔒 *Status:* ${groupMetadata.restrict ? 'Terbatas' : 'Terbuka'}
│ ◦ 🌟 *Admin Bot:* ${groupMetadata.participants.find(p => p.id === conn.user.jid)?.admin ? '✅' : '❌'}
│
├───「 📎 *LINK GROUP* 」
│
│ ${inviteLink}
│
╰───「 © shanove 」

💡 *Tips:* Klik link di atas untuk join group!
        `.trim();

        // Kirim hasil
        await conn.sendMessage(m.chat, {
            text: resultText,
            contextInfo: {
                externalAdReply: {
                    title: `🔗 ${groupMetadata.subject}`,
                    body: `Group Link • ${groupMetadata.participants.length} Members`,
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: 'https://telegra.ph/file/3a34bfa58714bdef500d9.jpg',
                    sourceUrl: inviteLink
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.reply('❌ *Terjadi error!*\nPastikan:\n• Bot sudah join group\n• Group ID valid\n• Bot adalah admin di group');
    }
}

handler.help = ['getlink <group_id>']
handler.tags = ['group']
handler.command = /^(getlink|linkgc|gclink|invitelink)$/i
handler.group = false
handler.owner = true
handler.private = false
handler.admin = false
handler.botAdmin = false

module.exports = handler