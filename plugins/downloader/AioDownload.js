aimport fetch from 'node-fetch'

export const run = {
   usage: ['download'],
   hidden: ['dl', 'ig', 'instagram', 'fb', 'facebook', 'twitter', 'x', 'capcut', 'threads', 'pin'],
   use: 'link',
   category: 'downloader',
   async: async (m, { client, text, isPrefix, command }) => {
      let example = ''
      if (/ig|instagram/i.test(command)) example = `${isPrefix + command} https://www.instagram.com/p/xyz`
      else if (/spot/i.test(command)) example = `${isPrefix + command} http://open.spotify.com/track/xyz`
      else if (/fb|facebook/i.test(command)) example = `${isPrefix + command} https://www.facebook.com/watch?v=xyz`
      else example = `${isPrefix + command} https://www.instagram.com/p/xyz`

      if (!text) return client.reply(m.chat, `🚩 *Example :* ${example}`, m)

      client.reply(m.chat, '> _Sedang memproses permintaan..._', m)

      try {
         const headers = { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
         }

         const res = await fetch(`https://api.shanove.my.id/api/downloader/allinone?link=${text}`, { headers })
         const json = await res.json()

         if (!json.status && !json.data) return client.reply(m.chat, `❌ Gagal: ${json.message || 'Link error / Private'}`, m)

         const data = json.data || json.result
         if (!data) return client.reply(m.chat, '❌ Data kosong.', m)

         const medias = data.medias || []
         const title = data.title || 'No Title'
         
         let caption = `*SHANOVE DOWNLOADER*\n\n`
         caption += `• *Title:* ${title}\n`
         caption += `• *Source:* ${data.source || 'Unknown'}\n`
         caption += `• *Author:* ${data.author || '-'}\n\n`
         caption += `_*© Created by Shanove*_`

         const bestVideo = medias.find(v => v.quality === 'hd_no_watermark') || 
                           medias.find(v => v.quality === 'no_watermark') || 
                           medias.find(v => v.type === 'video')

         if (bestVideo) {
            await client.sendMessage(m.chat, { video: { url: bestVideo.url }, caption: caption, mimetype: 'video/mp4' }, { quoted: m })
            return
         }

         const isSlide = data.type === 'multiple' || medias.filter(v => v.type === 'image').length > 1
         if (isSlide) {
            for (let i = 0; i < medias.length; i++) {
               if (medias[i].type === 'image') {
                  await client.sendMessage(m.chat, { image: { url: medias[i].url }, caption: (i === 0) ? caption : '' }, { quoted: m })
               }
            }
            return
         }

         const image = medias.find(v => v.type === 'image')
         if (image) {
            await client.sendMessage(m.chat, { image: { url: image.url }, caption: caption }, { quoted: m })
            return
         }

         if (/spotify|soundcloud|audio/i.test(data.source)) {
            let audioUrl = data.url 
            const audioObj = medias.find(v => v.extension === 'mp3' || v.type === 'audio')
            if (audioObj) audioUrl = audioObj.url
            
            if (!audioUrl) return client.reply(m.chat, '❌ Audio source tidak ditemukan.', m)

            await client.sendMessage(m.chat, { 
               image: { url: data.thumbnail || 'https://telegra.ph/file/1e309d93618d7f7c19131.jpg' }, 
               caption: caption 
            }, { quoted: m })
            
            await client.sendMessage(m.chat, { 
               audio: { url: audioUrl }, 
               mimetype: 'audio/mpeg', 
               fileName: title + '.mp3',
               ptt: false 
            }, { quoted: m })
            return
         }

         client.reply(m.chat, '❌ Media tidak didukung.', m)

      } catch (e) {
         client.reply(m.chat, `❌ Error: ${e.message}`, m)
      }
   },
   error: false,
   limit: true
  }
