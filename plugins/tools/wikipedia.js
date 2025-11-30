let fetch = require('node-fetch')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `📚 *Contoh Penggunaan:*\n${usedPrefix}${command} Indonesia\n${usedPrefix}${command} JavaScript\n${usedPrefix}${command} Artificial Intelligence`
    
    try {
        // React ⌛ dulu
        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })
        
        // PAKAI WIKIPEDIA API LANGSUNG (paling reliable)
        let apiUrl = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`
        let res = await fetch(apiUrl)
        
        if (!res.ok) {
            // Coba dalam bahasa Inggris
            apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`
            res = await fetch(apiUrl)
        }
        
        if (!res.ok) throw '❌ Artikel tidak ditemukan di Wikipedia!'
        
        let article = await res.json()
        
        let message = `
╭───「 📚 𝗪𝗜𝗞𝗜𝗣𝗘𝗗𝗜𝗔 」
│
│ ◦ 🔍 *Pencarian:* ${text}
│ ◦ 🏷️ *Judul:* ${article.title || 'Tidak diketahui'}
│ ◦ 🌐 *Bahasa:* ${article.lang || 'Indonesia'}
│
├───「 📖 𝗗𝗘𝗦𝗞𝗥𝗜𝗣𝗦𝗜 」
│
│ ${article.description || 'Tidak ada deskripsi'}
│
├───「 📄 𝗜𝗦𝗜 𝗔𝗥𝗧𝗜𝗞𝗘𝗟 」
│
│ ${article.extract ? article.extract.substring(0, 1000) + (article.extract.length > 1000 ? '...' : '') : 'Tidak ada konten'}
│
╰───「 ✨ 𝗫𝗬𝗢𝗡-𝗕𝗢𝗧 」

🔗 *Baca selengkapnya:* ${article.content_urls?.desktop?.page || `https://id.wikipedia.org/wiki/${encodeURIComponent(text)}`}
        `.trim()

        // Kirim hasil
        await conn.sendMessage(m.chat, { 
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: `📚 ${article.title?.substring(0, 40) || text}`,
                    body: `Wikipedia • ${article.lang || 'ID'}`,
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    thumbnailUrl: article.thumbnail?.source || 'https://telegra.ph/file/3a34bfa58714bdef500d9.jpg',
                    sourceUrl: article.content_urls?.desktop?.page || `https://id.wikipedia.org/wiki/${encodeURIComponent(text)}`
                }
            }
        }, { quoted: m })
        
        // React ✅ setelah berhasil
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        
    } catch (error) {
        // React ❌ jika error
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        
        let errorMsg = `
╭───「 ❌ 𝗘𝗥𝗥𝗢𝗥 」
│
│ ◦ *Pesan:* ${error.message || error}
│
│ ◦ *Solusi:*
│ • Coba kata kunci yang lebih spesifik
│ • Gunakan bahasa Indonesia/Inggris
│ • Contoh: "Indonesia", "Bali", "Jakarta"
│
╰───「 🔧 𝗫𝗬𝗢𝗡-𝗕𝗢𝗧 」

💡 *Tips:* Gunakan huruf kapital untuk nama proper
Contoh: ${usedPrefix}wiki "Indonesia"
        `.trim()
        
        await m.reply(errorMsg)
    }
}

handler.help = ['wikipedia', 'wiki']
handler.tags = ['tools', 'education']
handler.command = /^(wiki|wikipedia)$/i
handler.limit = true
handler.group = false

module.exports = handler