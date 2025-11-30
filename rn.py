import os
import shutil

PLUGINS_DIR = 'plugins'
RENAME_COUNT = 0

def rename_files_recursively(root_dir):
    global RENAME_COUNT
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.js') and '-' in filename:
                old_path = os.path.join(dirpath, filename)
                
                # Mendapatkan nama baru (menghapus prefix)
                # Contoh: 'owner-cheat.js' -> 'cheat.js'
                new_filename = filename.split('-', 1)[-1]
                new_path = os.path.join(dirpath, new_filename)

                # Pastikan nama baru valid dan tidak konflik dengan file yang sudah ada
                if old_path != new_path and not os.path.exists(new_path):
                    try:
                        os.rename(old_path, new_path)
                        print(f"✅ [RENAME] {filename} -> {new_filename} (di folder: {os.path.basename(dirpath)})")
                        RENAME_COUNT += 1
                    except Exception as e:
                        # Ini akan menangkap error EPERM/EBUSY jika ada (walau seharusnya tidak terjadi saat bot mati)
                        print(f"❌ GAGAL RENAME {filename}: Izin Ditolak oleh Sistem ({e})")
                elif old_path != new_path and os.path.exists(new_path):
                    print(f"⚠️ SKIP KONFLIK: {new_filename} sudah ada. {filename} tidak diubah.")


if __name__ == "__main__":
    print("=================================================")
    print("🚀 MEMULAI PEMBERSIHAN NAMA FILE PLUGIN (PYTHON)")
    print("=================================================")
    
    if not os.path.isdir(PLUGINS_DIR):
        print(f"❌ Error: Folder '{PLUGINS_DIR}' tidak ditemukan.")
    else:
        # Jalankan Rename
        rename_files_recursively(PLUGINS_DIR)
        
        print("\n=================================================")
        print(f"✨ SELESAI! Total {RENAME_COUNT} file berhasil dirapikan.")
        print("Sekarang semua nama file sudah bersih.")
        print("=================================================")
