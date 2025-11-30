const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command, isPrems }) => {
    if (!isPrems) {
        return m.reply(`❌ *PREMIUM ONLY*\n\nSpotify Search hanya untuk user premium!\nKetik *${usedPrefix}buypremium* untuk upgrade`);
    }

    const query = args.join(' ');
    if (!query) {
        return m.reply(`❌ *Query pencarian kosong!*\n\nUsage: ${usedPrefix}${command} <judul/artist>\n\nContoh:\n${usedPrefix}${command} coldplay yellow\n${usedPrefix}${command} "shape of you ed sheeran"`);
    }

    try {
        await m.reply(`🔍 *Mencari di Spotify...*\n\n"${query}"`);

        const searchUrl = `https://api.betabotz.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${global.lann}`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (!data.status || !data.result.length) {
            return m.reply(`❌ *Tidak ada hasil untuk* "${query}"\n\nCoba dengan kata kunci yang berbeda.`);
        }

        const results = data.result.slice(0, 6);
        let resultText = `🎧 *SPOTIFY SEARCH RESULTS*\n\nQuery: "${query}"\n\n`;

        results.forEach((track, index) => {
            resultText += `*${index + 1}. ${track.title}*\n`;
            resultText += `   👤 ${track.artist}\n`;
            resultText += `   💽 ${track.album || '-'}\n`;
            resultText += `   ⏱️ ${track.duration || '-'}\n`;
            resultText += `   🔗 ${track.url}\n`;
            resultText += `   📥 *${usedPrefix}spotify ${track.url}*\n\n`;
        });

        resultText += `💡 *Download dengan menyalin link dan ketik:*\n${usedPrefix}spotify <url>`;

        await conn.sendMessage(m.chat, { 
            text: resultText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `🔍 "${query}"`,
                    body: `Ditemukan ${results.length} hasil`,
                    mediaType: 1,
                    thumbnailUrl: results[0]?.thumbnail || 'https://telegra.ph/file/8e9c4634ce8d37279b927.jpg',
                    sourceUrl: 'https://spotify.com'
                }
            }
        });

    } catch (error) {
        console.error('Spotify Search Error:', error);
        await m.reply(`❌ *Error Search*\n\n${error.message}\n\nCoba lagi beberapa saat.`);
    }
};

handler.help = ['spotifysearch'];
handler.tags = ['premium', 'download'];
handler.command = /^(spotifysearch|spotisearch|searchspotify)$/i;
handler.premium = true;

module.exports = handler;