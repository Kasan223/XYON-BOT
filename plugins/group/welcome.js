let handler = async (m, { conn }) => {
    let welcome = `
╭───「 👋 WELCOME 」 
│
│ ◦ 🎉 Selamat datang di group!
│ ◦ 🤖 Ini adalah bot WhatsApp
│ ◦ 📚 Group: *%subject*
│
│ ◦ 👤 *User:* @%user
│ ◦ 👥 *Member ke:* %member
│ ◦ 📅 *Join:* %date
│
│ ◦ 📝 *Deskripsi Group:*
│ %desc
│
╰───「 %ucapan 」

💡 *Rules Group:*
• Hormati semua member
• No spam, no pornografi
• Jangan beriklan tanpa izin
• Gunakan bot dengan bijak

_Semoga betah di group ini!_
    `.trim()

    // Data untuk replace
    let replacements = {
        '%subject': await conn.getName(m.chat),
        '%user': m.sender.split('@')[0],
        '%member': (await conn.groupMetadata(m.chat)).participants.length,
        '%date': new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        '%desc': (await conn.groupMetadata(m.chat)).desc?.toString() || 'Tidak ada deskripsi',
        '%ucapan': getGreeting()
    }

    // Replace semua placeholder
    let finalWelcome = welcome
    for (let [key, value] of Object.entries(replacements)) {
        finalWelcome = finalWelcome.replace(new RegExp(key, 'g'), value)
    }

    // Kirim welcome message
    await conn.sendMessage(m.chat, {
        text: finalWelcome,
        mentions: [m.sender],
        contextInfo: {
            externalAdReply: {
                title: `🎉 Welcome to ${replacements['%subject']}`,
                body: `Member ke-${replacements['%member']} • ${getGreeting()}`,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: 'https://telegra.ph/file/3a34bfa58714bdef500d9.jpg',
                sourceUrl: 'https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q'
            }
        }
    })

    // Kirim sticker welcome (opsional)
    try {
        let stiker = await conn.sendMessage(m.chat, {
            sticker: fs.readFileSync('./src/welcome.webp')
        }, { quoted: null })
    } catch (e) {
        console.log('Sticker welcome tidak ditemukan, skip...')
    }
}

// Function untuk ucapan berdasarkan waktu
function getGreeting() {
    let hour = new Date().getHours()
    if (hour >= 4 && hour < 10) return '🌄 Selamat Pagi'
    if (hour >= 10 && hour < 15) return '☀️ Selamat Siang' 
    if (hour >= 15 && hour < 18) return '🌅 Selamat Sore'
    if (hour >= 18 && hour < 24) return '🌙 Selamat Malam'
    return '🌌 Selamat Beristirahat'
}

// Event handler untuk participant update
handler.event = 'group-participants-update'
handler.tags = ['group']
handler.command = /^(welcome)$/i
handler.group = true
handler.botAdmin = true

module.exports = handler

// Additional handler untuk auto welcome
let welcomeHandler = m => {
    let participants = m.participants
    for (let user of participants) {
        if (user.action === 'add') {
            // Panggil welcome handler
            handler(m, { conn: this })
        }
    }
}

// Export kedua handler
module.exports.welcomeHandler = welcomeHandler