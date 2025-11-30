let search = require("yt-search");
let axios = require("axios");

let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) throw 'Enter Title / Link From YouTube!';
    try {
        // React ⌛ dulu sebelum proses
        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
        
        const look = await search(text);
        const convert = look.videos[0];
        if (!convert) throw 'Video/Audio Tidak Ditemukan';
        if (convert.seconds >= 3600) {
            return conn.reply(m.chat, 'Video is longer than 1 hour!', m);
        } else {
            let audioUrl = await youtube(convert.url);

            // Debug: Lihat response dari API
            console.log('Audio URL Response:', audioUrl);

            // Langsung kirim audio
            await conn.sendMessage(m.chat, {
                audio: {
                    url: audioUrl.result.mp3
                },
                mimetype: 'audio/mpeg',
                contextInfo: {
                    externalAdReply: {
                        title: convert.title,
                        body: `Duration: ${convert.timestamp} • Views: ${convert.views}`,
                        thumbnailUrl: convert.image,
                        sourceUrl: convert.url,
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: true
                    }
                }
            }, {
                quoted: m
            });

            // React ✅ setelah berhasil
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }
    } catch (e) {
        // React ❌ jika error
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `*Error:* ` + e.message, m);
    }
};

handler.command = handler.help = ['play', 'ds', 'song'];
handler.tags = ['downloader'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;

async function youtube(url) {
   try {
   // PASTIKAN VARIABLE 'lann' ADA DI FILE UTAMA
   // Jika tidak ada, ganti dengan string kosong atau 'Admin'
   const apiKey = typeof lann !== 'undefined' ? lann : 'Admin';
   const { data } = await axios.get("https://api.betabotz.eu.org/api/download/yt?url="+url+"&apikey="+lann)
   return data;
   } catch (e) {
   return e;
   }
}