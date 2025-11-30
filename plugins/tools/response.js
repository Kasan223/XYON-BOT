let handler = m => m

handler.all = async function (m, { conn }) {
    // 1. Filter Dasar
    if (m.chat.endsWith('broadcast')) return // Jangan respon broadcast
    if (m.fromMe) return // Jangan respon diri sendiri
    if (!m.text) return // Hanya respon teks

    // 2. Definisi Kata Panggilan (Regex)
    // ^ = Awal kalimat, $ = Akhir kalimat, | = Atau, i = Huruf besar/kecil sama aja
    // Artinya: Hanya merespon jika chatnya PERSIS "bot", "xyon", atau "leo" (tanpa tambahan kata lain)
    // Kalau mau supaya bisa nyempil di kalimat (misal: "halo xyon"), hapus tanda ^ dan $
    let trigger = /^(bot|xyon|leo)$/i

    if (trigger.test(m.text)) {
        
        // 3. List Jawaban Imut (Random)
        let responses = [
            "Iya kak, Xyon on kok! 😸",
            "Dalem kak... butuh bantuan Xyon kah? ✨",
            "Ada apa panggil-panggil? Kangen ya? 😚",
            "Iya kak... jangan spam ya, nanti Xyon pusing 🥺",
            "Hadir kak! Mau main sama Xyon? 🎮",
            "Moshi moshi... Xyon is here! 🎀",
            "Apa ciii panggil-panggil tulu... 😤❤️"
        ]

        let randomAnswer = responses[Math.floor(Math.random() * responses.length)]

        // 4. Kirim Balasan (Reply)
        // Menggunakan m.reply agar men-tag orang yang memanggil
        m.reply(randomAnswer)
        
        // (Opsional) Tambahkan reaksi love biar makin imut
        await conn.sendMessage(m.chat, { react: { text: '🥰', key: m.key } })
    }

    return !0
}

module.exports = handler