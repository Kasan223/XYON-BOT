# 🤖 SN-MD: WhatsApp Multi-Device Bot

Bot ini adalah hasil *fork* dan pengembangan dari base populer **RTXZY-MD / BETABOTZ-MD2** dengan fokus pada fitur eksklusif, RPG yang lebih stabil, dan tools khusus Owner.

---

## 📝 DESKRIPSI SINGKAT

[span_0](start_span)SN-MD didesain untuk stabilitas dan memiliki fitur-fitur yang 90%[span_0](end_span) bergantung pada layanan **RestApi** berbayar (BetaBotz). Fitur-fitur utamanya meliputi sistem Anti-Toxic & Warn, sistem ekonomi RPG yang mendalam, dan tools manajemen file.

---

## 🚀 PERSIAPAN & INSTALASI

### 🛠️ Persyaratan Sistem
* **[span_1](start_span)[span_2](start_span)Node.js:** Versi v20+[span_1](end_span)[span_2](end_span) (Wajib).
* **[span_3](start_span)Dependencies:** `ffmpeg`, `imagemagick`, `webp` (wajib diinstal di hosting Anda).[span_3](end_span)

### ⚙️ Langkah Instalasi

1.  **Clone Repositori:**
    ```bash
    git clone [https://github.com/USER_ANDA/SN-MD.git](https://github.com/USER_ANDA/SN-MD.git)
    cd SN-MD
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Setup ApiKey:** (Lanjut ke bagian konfigurasi API)
4.  **Jalankan Bot:**
    ```bash
    npm start
    ```

---

## 🔑 KONFIGURASI API (WAJIB!)

Bot ini mengandalkan API dari **Lann** (`api.betabotz.eu.org`) untuk menjalankan hampir semua fitur Downloader dan Tools. [span_4](start_span)Anda **wajib** memiliki ApiKey yang valid.[span_4](end_span)

1.  **Daftar ApiKey:**
    * Registrasi dan dapatkan ApiKey Anda di: `https://api.betabotz.eu.org/price`
2.  **Masukkan Key:**
    * Buka file `config.js`.
    * Masukkan Key Anda ke variabel `global.lann`.
    ```javascript
    // config.js
    global.lann = 'API_KEY_ANDA'; 
    ```
3.  **Whitelist IP:**
    * [span_5](start_span)Jangan lupa *whitelist* IP bot Anda di halaman *Settings* API BetaBotz.[span_5](end_span)

---

## ✨ FITUR UNGGULAN & EKSKLUSIF

* **Custom Login:** Support Login menggunakan **Pairing Code** (Node.js v20+).
* **Recursive Plugin Loader:** Bot dapat membaca plugin di folder bertingkat (misal: `plugins/game/tebak.js`) tanpa *crash*.
* **Anti-Toxic Pro:** Sistem Warning dan Auto-Kick (Maks 2 Warn) dengan deteksi kata kasar yang ketat.
* **Hybrid Downloader:** Mendukung Download MediaFire (Scraping Langsung) dan Spotify/Music (Proxy Search).
* **RPG Financial Control:** Owner Tools untuk Reset Item Rare (`Mythic`, `Legendary`) dan Reset Money/Limit user.
* **Channel Verification Guard:** Gerbang verifikasi bagi user baru agar *wajib* follow Channel WhatsApp sebelum menggunakan bot.

---

## 👥 KONTRIBUTOR

List semua kontributor project ini. (Nama dan URL bisa Anda isi sendiri):

1.  [`[Nama Kontributor 1]`](https://github.com/URL)
2.  [`[Nama Kontributor 2]`](https://github.com/URL)
3.  [`[Nama Kontributor 3]`](https://github.com/URL)

---

## 🙏 SPECIAL THANKS TO

Terima kasih sebesar-besarnya kepada pihak-pihak yang telah mendukung pengembangan script ini:

* Allah SWT
* Hyzer
* Erlanrahmat
* BOTCAHX
* Kurukuu-MD
* Bintang (S-N FM)
* Kasan (S-N FM)
* Kalian semua yang telah menggunakan script ini.

---

*[span_6](start_span)Base Original: [ZukaBet](https://github.com/HelgaIlham/ZukaBet)*[span_6](end_span)
*Developed by Shanove (Leo)*