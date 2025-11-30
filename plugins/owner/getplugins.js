const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`
┌  📂 *GET PLUGIN*
│  
│  Ambil source code file plugin.
│  *Format:* ${usedPrefix + command} <nama_file>
│  
└  *Contoh:* ${usedPrefix + command} tebakgambar.js
    `.trim());

    // 1. Tentukan folder dasar pencarian (folder plugins)
    // path.join(__dirname, '..') digunakan jika file ini ada di dalam subfolder (misal plugins/owner/)
    // Agar aman, kita cari dari root project/plugins
    let pluginsDir = path.join(process.cwd(), 'plugins'); 

    // 2. FUNGSI PENCARI FILE OTOMATIS (REKURSIF)
    // Fungsi ini akan 'menggali' semua folder sampai ketemu filenya
    const findFileRecursively = (basePath, filenameToFind) => {
        if (!fs.existsSync(basePath)) return null;
        
        let files = fs.readdirSync(basePath);
        
        for (let file of files) {
            let fullPath = path.join(basePath, file);
            let stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Jika folder, cari lagi di dalamnya (Recursive)
                let found = findFileRecursively(fullPath, filenameToFind);
                if (found) return found;
            } else {
                // Jika file, cek apakah namanya sama (Case Insensitive)
                if (file.toLowerCase() === filenameToFind.toLowerCase()) {
                    return fullPath;
                }
            }
        }
        return null;
    };

    // 3. EKSEKUSI PENCARIAN
    let foundPath = findFileRecursively(pluginsDir, text);

    if (!foundPath) {
        return m.reply(`
❌ *FILE TIDAK DITEMUKAN!*

Bot sudah mencari ke semua folder (game, tools, owner, dll) tapi file *"${text}"* tidak ada.
Pastikan ejaan benar dan sertakan (.js) jika perlu.
`.trim());
    }

    // 4. BACA DAN KIRIM FILE
    try {
        let filename = path.basename(foundPath);
        // Ambil nama folder tempat file berada
        let folderName = path.dirname(foundPath).split(path.sep).pop(); 
        
        let sourceCode = fs.readFileSync(foundPath, 'utf-8');
        
        let caption = `
📂 *FILE FOUND!*
📁 *Folder:* ${folderName}
📄 *File:* ${filename}

\`\`\`javascript
${sourceCode}
\`\`\`
        `.trim();

        m.reply(caption);
    } catch (e) {
        console.error(e);
        m.reply('❌ Gagal membaca file. Mungkin file corrupt atau tidak ada akses.');
    }
}

handler.help = ['getplugin <namafile>', 'gp <namafile>'];
handler.tags = ['owner'];
handler.command = /^(getplugin|gp)$/i;
handler.owner = true;

module.exports = handler;