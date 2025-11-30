let handler = async (m, { conn, usedPrefix, command, text, args }) => {
    // In-memory storage untuk email (bisa ganti dengan database)
    if (!conn.anonymousEmails) conn.anonymousEmails = new Map()
    
    try {
        // CREATE ANONYMOUS EMAIL
        if (command === 'emailcreate' || (command === 'email' && (!text || text === 'create'))) {
            let emailId = generateEmailId()
            let inbox = []
            
            conn.anonymousEmails.set(emailId, {
                id: emailId,
                createdAt: new Date(),
                inbox: inbox,
                lastChecked: null
            })
            
            let emailMsg = `
╭───「 📧 𝗔𝗡𝗢𝗡𝗬𝗠𝗢𝗨𝗦 𝗘𝗠𝗔𝗜𝗟 」
│
│ ◦ 📨 *Email Created!*
│ ◦ 🆔 *Email ID:* ${emailId}@anon.xyon
│ ◦ ⏰ *Created:* ${new Date().toLocaleString('id-ID')}
│
│ ◦ 💡 *Cara Pakai:*
│ • Kirim ke: ${emailId}@anon.xyon
│ • Cek inbox: ${usedPrefix}email inbox ${emailId}
│ • Hapus email: ${usedPrefix}email delete ${emailId}
│
│ ◦ 🔒 *Fitur:*
│ • 100% Anonymous
│ • Auto delete dalam 24 jam
│ • No registration needed
│
╰───「 © XYON-BOT 」
            `.trim()
            
            await conn.sendMessage(m.chat, { 
                text: emailMsg,
                contextInfo: {
                    externalAdReply: {
                        title: `📧 Anonymous Email Created`,
                        body: `ID: ${emailId}@anon.xyon`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://telegra.ph/file/3a34bfa58714bdef500d9.jpg',
                        sourceUrl: 'https://github.com'
                    }
                }
            })
            return
        }
        
        // SEND EMAIL
        if (command === 'emailsend' || (args[0] === 'send' && args.length >= 3)) {
            let emailId, receiverEmail, message
            
            if (command === 'emailsend') {
                let parts = text.split('|')
                if (parts.length < 3) throw `Format: ${usedPrefix}emailsend email_id|receiver@anon.xyon|message\nContoh: ${usedPrefix}emailsend abc123|xyz789@anon.xyon|Hello world!`
                
                emailId = parts[0].trim()
                receiverEmail = parts[1].trim()
                message = parts.slice(2).join('|').trim()
            } else {
                emailId = args[1]
                receiverEmail = args[2]
                message = args.slice(3).join(' ')
            }
            
            // Validasi email ID pengirim
            if (!conn.anonymousEmails.has(emailId)) {
                throw '❌ Email ID pengirim tidak valid! Buat email dulu dengan: ' + usedPrefix + 'emailcreate'
            }
            
            // Extract receiver ID dari email
            let receiverId = receiverEmail.replace('@anon.xyon', '')
            
            // Validasi email penerima
            if (!conn.anonymousEmails.has(receiverId)) {
                throw '❌ Email penerima tidak ditemukan!'
            }
            
            let receiverData = conn.anonymousEmails.get(receiverId)
            let email = {
                id: generateMessageId(),
                from: `${emailId}@anon.xyon`,
                to: receiverEmail,
                subject: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                message: message,
                timestamp: new Date(),
                read: false
            }
            
            receiverData.inbox.push(email)
            receiverData.lastChecked = new Date()
            
            await m.reply(`✅ Email terkirim ke ${receiverEmail}!`)
            
            // Notify receiver jika online
            try {
                let notifyMsg = `
📧 *Email Baru!*
Dari: ${emailId}@anon.xyon
Subjek: ${email.subject}

Cek dengan: ${usedPrefix}email inbox ${receiverId}
                `.trim()
                await conn.sendMessage(m.chat, { text: notifyMsg }) // Bisa dikirim ke user tertentu
            } catch (e) {
                console.log('Tidak bisa kirim notifikasi')
            }
            
            return
        }
        
        // CHECK INBOX
        if (command === 'emailinbox' || (args[0] === 'inbox' && args[1])) {
            let emailId = args[1] || text
            
            if (!conn.anonymousEmails.has(emailId)) {
                throw '❌ Email ID tidak ditemukan! Buat dengan: ' + usedPrefix + 'emailcreate'
            }
            
            let emailData = conn.anonymousEmails.get(emailId)
            let inbox = emailData.inbox
            
            // Update last checked
            emailData.lastChecked = new Date()
            
            if (inbox.length === 0) {
                await m.reply(`📭 *Inbox Kosong*\n\nEmail ID: ${emailId}@anon.xyon\nBelum ada email yang diterima.`)
                return
            }
            
            let inboxMsg = `
╭───「 📧 𝗜𝗡𝗕𝗢𝗫 - ${emailId}@anon.xyon 」
│
│ ◦ 📥 *Total Email:* ${inbox.length}
│ ◦ ⏰ *Terakhir dicek:* ${new Date().toLocaleString('id-ID')}
│
├───「 📨 𝗘𝗠𝗔𝗜𝗟𝗦 」
│
            `.trim()
            
            // Tampilkan 5 email terbaru
            let recentEmails = inbox.slice(-5).reverse()
            for (let i = 0; i < recentEmails.length; i++) {
                let email = recentEmails[i]
                let status = email.read ? '✅' : '🆕'
                inboxMsg += `\n│ ${status} *${email.from}*\n│ 📝 ${email.subject}\n│ ⏰ ${email.timestamp.toLocaleString('id-ID')}\n│`
            }
            
            inboxMsg += `\n╰───「 © XYON-BOT 」\n\n💡 Lihat detail: ${usedPrefix}email read ${emailId} <email_number>`
            
            await conn.sendMessage(m.chat, { text: inboxMsg })
            return
        }
        
        // READ SPECIFIC EMAIL
        if (command === 'emailread' || (args[0] === 'read' && args[2])) {
            let emailId = args[1]
            let emailIndex = parseInt(args[2]) - 1
            
            if (!conn.anonymousEmails.has(emailId)) {
                throw '❌ Email ID tidak ditemukan!'
            }
            
            let emailData = conn.anonymousEmails.get(emailId)
            let inbox = emailData.inbox
            
            if (emailIndex < 0 || emailIndex >= inbox.length) {
                throw `❌ Email #${emailIndex + 1} tidak ditemukan! Inbox hanya ada ${inbox.length} email.`
            }
            
            let email = inbox[emailIndex]
            email.read = true // Mark as read
            
            let readMsg = `
╭───「 📧 𝗘𝗠𝗔𝗜𝗟 𝗗𝗘𝗧𝗔𝗜𝗟 」
│
│ ◦ 📨 *Dari:* ${email.from}
│ ◦ 📬 *Kepada:* ${email.to}
│ ◦ ⏰ *Waktu:* ${email.timestamp.toLocaleString('id-ID')}
│
├───「 📝 𝗣𝗘𝗦𝗔𝗡 」
│
│ ${email.message}
│
╰───「 © XYON-BOT 」
            `.trim()
            
            await conn.sendMessage(m.chat, { text: readMsg })
            return
        }
        
        // DELETE EMAIL
        if (command === 'emaildelete' || (args[0] === 'delete' && args[1])) {
            let emailId = args[1] || text
            
            if (!conn.anonymousEmails.has(emailId)) {
                throw '❌ Email ID tidak ditemukan!'
            }
            
            conn.anonymousEmails.delete(emailId)
            await m.reply(`✅ Email ${emailId}@anon.xyon berhasil dihapus!`)
            return
        }
        
        // LIST ALL EMAILS (for user)
        if (command === 'emaillist') {
            let userEmails = []
            
            for (let [emailId, data] of conn.anonymousEmails) {
                // Cek jika email dibuat oleh user ini (simplified)
                userEmails.push({
                    id: emailId,
                    createdAt: data.createdAt,
                    emailCount: data.inbox.length
                })
            }
            
            if (userEmails.length === 0) {
                await m.reply(`📧 *Tidak ada email*\n\nBuat email anonymous dengan: ${usedPrefix}emailcreate`)
                return
            }
            
            let listMsg = `
╭───「 📧 𝗠𝗬 𝗔𝗡𝗢𝗡𝗬𝗠𝗢𝗨𝗦 𝗘𝗠𝗔𝗜𝗟𝗦 」
│
│ ◦ 📨 *Total Email:* ${userEmails.length}
│
├───「 📋 𝗗𝗔𝗙𝗧𝗔𝗥 𝗘𝗠𝗔𝗜𝗟 」
│
            `.trim()
            
            userEmails.forEach((email, index) => {
                listMsg += `\n│ ${index + 1}. ${email.id}@anon.xyon\n│   📥 ${email.emailCount} email • ${email.createdAt.toLocaleDateString('id-ID')}\n│`
            })
            
            listMsg += `\n╰───「 © XYON-BOT 」`
            
            await conn.sendMessage(m.chat, { text: listMsg })
            return
        }
        
        // HELP COMMAND
        if (!text || text === 'help') {
            let helpMsg = `
╭───「 📧 𝗔𝗡𝗢𝗡𝗬𝗠𝗢𝗨𝗦 𝗘𝗠𝗔𝗜𝗟 𝗛𝗘𝗟𝗣 」
│
│ ◦ ${usedPrefix}emailcreate - Buat email anonymous
│ ◦ ${usedPrefix}emailsend <id>|<target>|<message> - Kirim email
│ ◦ ${usedPrefix}emailinbox <email_id> - Cek inbox
│ ◦ ${usedPrefix}emailread <email_id> <number> - Baca email
│ ◦ ${usedPrefix}emaildelete <email_id> - Hapus email
│ ◦ ${usedPrefix}emaillist - Lihat semua email kamu
│
├───「 📝 𝗖𝗢𝗡𝗧𝗢𝗛 」
│
│ ◦ ${usedPrefix}emailcreate
│ ◦ ${usedPrefix}emailsend abc123|xyz789@anon.xyon|Hello!
│ ◦ ${usedPrefix}emailinbox xyz789
│ ◦ ${usedPrefix}emailread xyz789 1
│
╰───「 © XYON-BOT 」
            `.trim()
            
            await conn.sendMessage(m.chat, { text: helpMsg })
            return
        }
        
    } catch (error) {
        console.error(error)
        await m.reply(`❌ Error: ${error.message || error}`)
    }
}

// Helper functions
function generateEmailId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Auto cleanup setiap 24 jam
setInterval(() => {
    if (!conn.anonymousEmails) return
    
    let now = new Date()
    let deletedCount = 0
    
    for (let [emailId, data] of conn.anonymousEmails) {
        let age = now - data.createdAt
        if (age > 24 * 60 * 60 * 1000) { // 24 jam
            conn.anonymousEmails.delete(emailId)
            deletedCount++
        }
    }
    
    if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired anonymous emails`)
    }
}, 60 * 60 * 1000) // Check every hour

handler.help = [
    'emailcreate',
    'emailsend <id|target|message>', 
    'emailinbox <email_id>',
    'emailread <email_id> <number>',
    'emaildelete <email_id>',
    'emaillist',
    'email help'
]

handler.tags = ['tools', 'anonymous']
handler.command = /^(email|anonymousemail)(create|send|inbox|read|delete|list)?$/i
handler.limit = true
handler.group = false

module.exports = handler