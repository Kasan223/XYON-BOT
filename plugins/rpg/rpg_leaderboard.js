let handler = async (m, { conn, args }) => {
    // Ambil semua user dari database
    let users = Object.entries(global.db.data.users).map(([key, value]) => {
        return { ...value, jid: key }
    })
    
    // Filter user yang memiliki data meaningful (bukan 0 atau undefined)
    let activeUsers = users.filter(user => 
        (user.exp && user.exp > 0) || 
        (user.money && user.money > 0) || 
        (user.limit && user.limit > 0) || 
        (user.level && user.level > 0) || 
        (user.bank && user.bank > 0)
    )
    
    if (activeUsers.length === 0) return m.reply('❌ Tidak ada data leaderboard saat ini!')

    // Sort data dengan benar (descending)
    let sortedExp = [...activeUsers].sort((a, b) => (b.exp || 0) - (a.exp || 0))
    let sortedMoney = [...activeUsers].sort((a, b) => (b.money || 0) - (a.money || 0))
    let sortedBank = [...activeUsers].sort((a, b) => (b.bank || 0) - (a.bank || 0))
    let sortedLimit = [...activeUsers].sort((a, b) => (b.limit || 0) - (a.limit || 0))
    let sortedLevel = [...activeUsers].sort((a, b) => (b.level || 0) - (a.level || 0))

    let len = args[0] && !isNaN(args[0]) ? Math.min(20, Math.max(parseInt(args[0]), 5)) : Math.min(10, activeUsers.length)

    // Fungsi untuk mendapatkan rank user
    const getUserRank = (sortedArray, jid) => {
        return sortedArray.findIndex(user => user.jid === jid) + 1
    }

    // Fungsi untuk format section
    const createSection = (title, sortedData, userRank, emoji, dataKey) => {
        let section = `├───「 ${emoji} *${title}* 」\n│\n`
        
        sortedData.slice(0, len).forEach((user, i) => {
            let value = user[dataKey] || 0
            let displayValue = dataKey === 'level' ? `Level ${value}` : `${value.toLocaleString()} ${dataKey}`
            
            section += `│ ${i < 3 ? ['🥇','🥈','🥉'][i] : '▸'} ${i + 1}. @${user.jid.split('@')[0]}\n`
            section += `│    ➥ *${displayValue}*${user.jid === m.sender ? ' 👈' : ''}\n│\n`
        })
        
        let userData = sortedData.find(user => user.jid === m.sender)
        let userValue = userData ? userData[dataKey] || 0 : 0
        let userDisplay = dataKey === 'level' ? `Level ${userValue}` : `${userValue.toLocaleString()} ${dataKey}`
        
        section += `│ 🎯 *Posisi Kamu:* #${userRank} • ${userDisplay}\n│\n`
        return section
    }

    let text = `
╭───「 🏆 *LEADERBOARD* 」
│
│ ▸ 📊 *Top ${len} Players*
│ ▸ 📈 Total Users: ${activeUsers.length}
│
${createSection('EXPERIENCE', sortedExp, getUserRank(sortedExp, m.sender), '💫', 'exp')}
${createSection('MONEY', sortedMoney, getUserRank(sortedMoney, m.sender), '💰', 'money')}
${createSection('BANK', sortedBank, getUserRank(sortedBank, m.sender), '🏦', 'bank')}
${createSection('LIMIT', sortedLimit, getUserRank(sortedLimit, m.sender), '⚡', 'limit')}
${createSection('LEVEL', sortedLevel, getUserRank(sortedLevel, m.sender), '📈', 'level')}
╰───「 © shanove 」
    `.trim()

    // Kumpulkan semua jid untuk mention
    let mentionedJids = []
    sortedExp.slice(0, len).forEach(user => mentionedJids.push(user.jid))
    sortedMoney.slice(0, len).forEach(user => mentionedJids.push(user.jid))
    sortedBank.slice(0, len).forEach(user => mentionedJids.push(user.jid))
    sortedLimit.slice(0, len).forEach(user => mentionedJids.push(user.jid))
    sortedLevel.slice(0, len).forEach(user => mentionedJids.push(user.jid))
    
    // Hapus duplikat
    mentionedJids = [...new Set(mentionedJids)]

    await conn.sendMessage(m.chat, {
        text: text,
        mentions: mentionedJids
    }, { quoted: m })
}

handler.help = ['leaderboard <jumlah>']
handler.tags = ['rpg', 'info']
handler.command = /^(leaderboard|lb|top|ranking)$/i
handler.group = true
handler.rpg = true

module.exports = handler