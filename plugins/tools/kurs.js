let fetch = require('node-fetch')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) {
        return conn.reply(m.chat, `
┌  💱 *CURRENCY CONVERTER*
│  
│  Ubah mata uang dengan mudah.
│  Format: *${usedPrefix + command} <jumlah> <code> <to_code>*
│  
│  *Contoh:*
│  • ${usedPrefix + command} 25 USD IDR
│  • ${usedPrefix + command} 10000 IDR to USD
│  • ${usedPrefix + command} 50 MYR IDR
│  
└  _Gunakan kode mata uang (USD, IDR, MYR, JPY, dll)_
`.trim(), m)
    }

    // 2. Parsing Text (Membersihkan input user)
    // Menghapus kata "to" atau "ke" jika user mengetiknya
    let cleanText = text.replace(/ to | ke /i, ' ').split(' ').filter(v => v)
    
    // Logika pengambilan variabel: [Jumlah] [Dari] [Ke]
    let amount = parseFloat(cleanText[0])
    let from = cleanText[1]?.toUpperCase()
    let to = cleanText[2]?.toUpperCase()

    // Cek kelengkapan
    if (isNaN(amount) || !from || !to) {
        return conn.reply(m.chat, `❌ Format salah! Contoh: *${usedPrefix + command} 10 USD IDR*`, m)
    }

    try {
        m.reply('⏳ _Sedang menghitung kurs..._')

        // 3. Request ke API Exchange Rate (Gratis & Stabil)
        let res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
        if (!res.ok) throw 'Mata uang tidak ditemukan/API Error'
        
        let json = await res.json()
        let rate = json.rates[to]

        if (!rate) {
            return conn.reply(m.chat, `❌ Kode mata uang tujuan *${to}* tidak valid/tidak didukung.`, m)
        }

        // 4. Kalkulasi
        let result = amount * rate
        
        // Format angka biar cantik (pake koma/titik)
        let formatter = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2
        })

        // 5. Tampilan Output Minimalis
        let caption = `
┌  💱 *CONVERSION RESULT*
│  
│  💵 *From:* ${formatter.format(amount)} ${from}
│  💰 *To:* ${formatter.format(result)} ${to}
│  
│  📊 *Exchange Rate:*
│  1 ${from} = ${formatter.format(rate)} ${to}
│  
└  _Update: ${json.date}_
`.trim()

        conn.reply(m.chat, caption, m)

    } catch (e) {
        console.log(e)
        conn.reply(m.chat, `❌ Gagal mengkonversi. Pastikan kode mata uang benar (contoh: IDR, USD, JPY).`, m)
    }
}

handler.help = ['convert <jumlah> <asal> <tujuan>']
handler.premium = true
handler.tags = ['tools']
handler.command = /^(convert|cnv|kurs|matauang)$/i

module.exports = handler