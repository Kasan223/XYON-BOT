let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Inisialisasi Database Game di Memory (RAM)
    global.ww = global.ww || {}
    
    // Ambil input command (join, start, dll)
    let args = text.split(' ')
    let action = args[0] ? args[0].toLowerCase() : false
    let id = m.chat // ID Grup

    // --- TAMPILAN MENU UTAMA ---
    if (!action) {
        return conn.reply(m.chat, `
┌  🐺 *WEREWOLF GAME*
│  
│  🎮 *Commands:*
│  • *${usedPrefix}ww create* - Buat room baru
│  • *${usedPrefix}ww join* - Masuk room
│  • *${usedPrefix}ww start* - Mulai game
│  • *${usedPrefix}ww leave* - Keluar room
│  • *${usedPrefix}ww player* - Cek pemain
│  
└  _Minimal 5 Pemain untuk start_
`.trim(), m)
    }

    // --- LOGIC GAME ---
    
    // 1. CREATE ROOM
    if (action === 'create' || action === 'buat') {
        if (global.ww[id]) return m.reply('❌ Game sudah ada di grup ini! Ketik *.ww join* untuk masuk.')
        
        global.ww[id] = {
            status: 'lobby',
            owner: m.sender,
            players: [], // List pemain
            roles: {},   // Peran pemain
            time: 'lobby'
        }
        // Otomatis join si pembuat room
        global.ww[id].players.push(m.sender)
        
        return conn.reply(m.chat, `
┌  ✅ *ROOM CREATED*
│  
│  Host: @${m.sender.split('@')[0]}
│  Status: Lobby Open
│  
└  _Ayo ketik *${usedPrefix}ww join* untuk masuk!_
`.trim(), m, { mentions: [m.sender] })
    }

    // Cek apakah room ada?
    if (!global.ww[id]) return m.reply('❌ Belum ada sesi Werewolf. Ketik *.ww create* dulu.')
    let game = global.ww[id]

    // 2. JOIN GAME
    if (action === 'join' || action === 'masuk') {
        if (game.status !== 'lobby') return m.reply('❌ Game sudah berjalan, tidak bisa join.')
        if (game.players.includes(m.sender)) return m.reply('❌ Kamu sudah ada di dalam room.')
        
        game.players.push(m.sender)
        
        return conn.reply(m.chat, `
┌  👋 *PLAYER JOINED*
│  
│  👤 @${m.sender.split('@')[0]} bergabung!
│  👥 Total: ${game.players.length} Pemain
│  
└  _Menunggu host memulai game..._
`.trim(), m, { mentions: [m.sender] })
    }

    // 3. LEAVE GAME
    if (action === 'leave' || action === 'keluar') {
        if (!game.players.includes(m.sender)) return m.reply('❌ Kamu belum join.')
        
        game.players = game.players.filter(p => p !== m.sender)
        m.reply(`👋 @${m.sender.split('@')[0]} keluar dari game.`, null, { mentions: [m.sender] })
        
        // Hapus room jika pemain 0
        if (game.players.length === 0) {
            delete global.ww[id]
            m.reply('⚠️ Room dihapus karena kosong.')
        }
        return
    }

    // 4. CHECK PLAYER
    if (action === 'player' || action === 'cek') {
        let textPlayers = game.players.map((p, i) => `${i + 1}. @${p.split('@')[0]}`).join('\n')
        return conn.reply(m.chat, `
┌  👥 *PLAYER LIST*
│  
${textPlayers}
│  
└  _Total: ${game.players.length} orang_
`.trim(), m, { mentions: game.players })
    }

    // 5. START GAME (Inti Fitur)
    if (action === 'start' || action === 'gas') {
        if (m.sender !== game.owner) return m.reply('❌ Hanya Host yang bisa memulai game.')
        if (game.players.length < 5) return m.reply('❌ Minimal 5 pemain untuk memulai! (Biar seru)')
        
        game.status = 'playing'
        
        // --- LOGIC DISTRIBUSI ROLE ---
        let players = [...game.players] // Copy array
        let total = players.length
        
        // Komposisi Role (Bisa diubah sesuai selera)
        let roleCount = {
            werewolf: Math.floor(total / 4) || 1, // 1 WW tiap 4 orang
            seer: 1, // Penerawang
            guardian: 1, // Penjaga
            villager: 0 // Sisanya warga
        }
        roleCount.villager = total - (roleCount.werewolf + roleCount.seer + roleCount.guardian)

        // Shuffle Array (Fisher-Yates)
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }

        // Assign Roles
        let roles = {}
        let assigned = 0

        // Bagi Role Werewolf
        for (let i = 0; i < roleCount.werewolf; i++) roles[players[assigned++]] = 'werewolf'
        // Bagi Role Seer
        for (let i = 0; i < roleCount.seer; i++) roles[players[assigned++]] = 'seer'
        // Bagi Role Guardian
        for (let i = 0; i < roleCount.guardian; i++) roles[players[assigned++]] = 'guardian'
        // Sisanya Villager
        while (assigned < total) roles[players[assigned++]] = 'villager'

        game.roles = roles

        // --- KIRIM PERAN KE PC (PRIVATE CHAT) ---
        m.reply('🎲 *Mengacak peran...* Cek Private Chat kalian!')
        
        for (let player of game.players) {
            let myRole = roles[player]
            let roleText = getRoleDesc(myRole)
            
            // Kirim ke PC
            await conn.sendMessage(player, { 
                text: roleText 
            }).catch(e => {
                conn.reply(m.chat, `❌ Gagal mengirim pesan ke @${player.split('@')[0]}, pastikan bot tidak diblokir/setting privasi open.`, m, { mentions: [player] })
            })
        }

        // Pengumuman di Grup
        setTimeout(() => {
            conn.reply(m.chat, `
┌  🌙 *MALAM PERTAMA*
│  
│  Semua warga desa tertidur...
│  Game dimulai!
│  
│  🐺 *Werewolf:* Silahkan diskusikan target di PC.
│  👁️ *Seer:* Terawang satu orang.
│  🛡️ *Guardian:* Lindungi satu orang.
│  
└  _Gunakan command game untuk beraksi (Next Update)_
`.trim(), m)
        }, 3000)
    }
}

// Helper: Deskripsi Role
function getRoleDesc(role) {
    if (role === 'werewolf') {
        return `
🐺 *KAMU ADALAH WEREWOLF*
Tugasmu: Membunuh warga desa tiap malam tanpa ketahuan.
JANGAN SAMPAI KETAHUAN!
`.trim()
    } else if (role === 'seer') {
        return `
👁️ *KAMU ADALAH SEER (PENERAWANG)*
Tugasmu: Menerawang identitas pemain lain di malam hari.
Cari siapa serigalanya!
`.trim()
    } else if (role === 'guardian') {
        return `
🛡️ *KAMU ADALAH GUARDIAN (PENJAGA)*
Tugasmu: Melindungi satu pemain dari serangan serigala tiap malam.
`.trim()
    } else {
        return `
👱 *KAMU ADALAH VILLAGER (WARGA)*
Tugasmu: Bertahan hidup dan temukan serigala melalui diskusi di pagi hari.
`.trim()
    }
}

handler.help = ['ww']
handler.tags = ['game']
handler.command = /^(ww|werewolf)$/i

module.exports = handler