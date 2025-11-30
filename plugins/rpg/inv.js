// File: inventory.js
let handler = async (m, { conn, args }) => {
    
    // --- KONFIGURASI MAPPING ITEM (Untuk efisiensi dan kejelasan) ---
    const WEAPON_MAP = [
        'Tidak Punya',
        'Tier I: Wood',
        'Tier II: Iron',
        'Tier III: Gold',
        'Tier IV: Diamond',
        'Tier V: Netherite',
        'Tier VI: Crystal',
        'Tier VII: Obsidian',
        'Tier VIII: Wither',
        'Tier IX: Dragon',
        'Tier X: Hacker',
        'Tier XI: GOD'
    ];
    // Catatan: Armor Tier 5 ('Emerald') dan Tier 8 ('Netherite') di kode lama agak berbeda.
    // Kami menyederhanakan Tiering untuk konsistensi, Anda bisa menyesuaikannya.
    
    // --- Penentuan Target ---
    let target = m.mentionedJid[0] || m.sender;
    let user = global.db.data.users[target];
    
    // Cek keberadaan User
    if (!user) {
        return conn.reply(m.chat, '❌ Data pengguna tidak ditemukan. Pastikan @tag sudah benar!', m);
    }

    // --- Ambil Data Kunci ---
    let { 
        armor, sword, fishingrod, pickaxe, katana, bow, axe,
        name, role, level, exp, limit, money, titlein, skill,
        healt, energi, stamina, speed, strenght, attack, defense,
        potion, diamond, emas, iron, berlian, emerald, litecoin, tiketcoin, batu, kayu, string, coal,
        armordurability, sworddurability, fishingroddurability, pickaxedurability, katanadurability, axedurability, bowdurability,
        common, uncommon, mythic, legendary,
        pet, makananpet, kucing, anjing, rubah, serigala, phonix
    } = user;

    // --- Fungsi Helper untuk mendapatkan nama item ---
    // Mengambil nama item dari map berdasarkan level numerik
    const getItemName = (level, type) => {
        // Handle kasus khusus untuk armor level 5 dan 8 jika Anda ingin nama spesifik
        if (type === 'Armor') {
            if (level === 5) return 'Tier V: Emerald';
            if (level === 8) return 'Tier VIII: Netherite';
        }
        return WEAPON_MAP[level] || 'Tidak Punya';
    };

    // --- Konstruksi Teks Inventory ---
    let capt = `
👤 *━━━ P R O F I L E ━━━* 🛡️

*Nama* : ${name || 'N/A'}
*Role* : ${role || 'Adventurer'}
*Level* : ${level || 0} (EXP: ${exp || 0})
*Skill* : ${skill || 'Tidak Ada'}
*Title* : ${titlein || 'No Title'}

💰 *━━━ E C O N O M Y ━━━* 💸
*Limit* : ${limit?.toLocaleString() || 0}
*Money* : ${money?.toLocaleString() || 0}

❤️ *━━━ S T A T U S ━━━* 📊
*Health* : ${healt || 0} ❤️
*Energi* : ${energi || 0} ⚡
*Stamina* : ${stamina || 0} 🔋
*Speed* : ${speed || 0} 💨
*Strength* : ${strenght || 0} 💪
*Attack* : ${attack || 0} ⚔️
*Defense* : ${defense || 0} 🛡️

🎒 *━━━ B A C K P A C K ━━━* 📦
*Potion* : ${potion?.toLocaleString() || 0} 🥤
*Diamond* : ${diamond?.toLocaleString() || 0} 💎
*Emas* : ${emas?.toLocaleString() || 0} ✨
*Iron* : ${iron?.toLocaleString() || 0} ⛓️
*Berlian* : ${berlian?.toLocaleString() || 0} 💍
*Emerald* : ${emerald?.toLocaleString() || 0} 🟢
*Litecoin* : ${litecoin?.toLocaleString() || 0} 🪙
*Tiketcoin* : ${tiketcoin?.toLocaleString() || 0} 🎫
*Batu* : ${batu?.toLocaleString() || 0} 🪨
*Kayu* : ${kayu?.toLocaleString() || 0} 🪵
*String* : ${string?.toLocaleString() || 0} 🕸️
*Coal* : ${coal?.toLocaleString() || 0} ⚫

⚔️ *━━━ E Q U I P M E N T ━━━* 🛠️
*Armor* : ${getItemName(armor, 'Armor')}
*Sword* : ${getItemName(sword, 'Sword')}
*Katana* : ${getItemName(katana, 'Katana')}
*Axe* : ${getItemName(axe, 'Axe')}
*Bow* : ${getItemName(bow, 'Bow')}
*Pickaxe* : ${getItemName(pickaxe, 'Pickaxe')}
*FishingRod* : ${getItemName(fishingrod, 'FishingRod')}

⚙️ *━━━ D U R A B I L I T Y ━━━* ⏳
*Armor* : ${armordurability || 0}
*Sword* : ${sworddurability || 0}
*Katana* : ${katanadurability || 0}
*Axe* : ${axedurability || 0}
*Bow* : ${bowdurability || 0}
*Pickaxe* : ${pickaxedurability || 0}
*FishingRod* : ${fishingroddurability || 0}

🎁 *━━━ U S E R B O X ━━━* 🔑
*Common* : ${common?.toLocaleString() || 0} 📦
*Uncommon* : ${uncommon?.toLocaleString() || 0} 🛍️
*Mythic* : ${mythic?.toLocaleString() || 0} 🎁
*Legendary* : ${legendary?.toLocaleString() || 0} 👑
*Total Box* : ${(common + uncommon + mythic + legendary)?.toLocaleString() || 0} 🗝️

🐾 *━━━ U S E R P E T S ━━━* 🍖
*Pet Token* : ${pet?.toLocaleString() || 0}
*Makanan Pet* : ${makananpet?.toLocaleString() || 0} 🥩
*Kucing* : Lv. ${kucing || 0} 🐈
*Anjing* : Lv. ${anjing || 0} 🐕
*Rubah* : Lv. ${rubah || 0} 🦊
*Serigala* : Lv. ${serigala || 0} 🐺
*Phonix* : Lv. ${phonix || 0} 🔥
`.trim()
  
    // Menggunakan conn.reply dengan contextInfo yang lebih profesional
    await conn.reply(m.chat, capt, m, {
        contextInfo: {
            externalAdReply: {
                title: `🛡️ INVENTORY ${user.name.toUpperCase()}`,
                body: `Level: ${user.level} | Role: ${user.role}`,
                thumbnailUrl: 'https://telegra.ph/file/ea3ee889b63edfb616c2d.jpg', // Ganti dengan thumbnail yang sesuai
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    })
}

handler.help = ['inventory *@user*']
handler.tags = ['rpg']
handler.command = /^inv|inventory$/i
handler.rpg = true
module.exports = handler