
# 💅 Elegance Beauty Booking System

Bu proje, bir güzellik salonu için online randevu oluşturma sistemidir. Kullanıcılar hizmetleri ve uzmanları inceleyebilir, uygun tarihlerde randevu oluşturabilir. Yönetici paneliyle randevular kolayca takip edilebilir.

---

## 🚀 Canlı Demo

🔗 [https://elegancebeautybookingsystem.onrender.com](https://elegancebeautybookingsystem.onrender.com)

> Bu bağlantı Render platformunda yayınlanmıştır ve gerçek zamanlı olarak çalışmaktadır.

---

## 🧰 Kullanılan Teknolojiler

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Veritabanı:** MySQL (Railway üzerinden barındırılıyor)
- **Deploy:** Render.com

---

## 📦 Projeyi Yerelde Çalıştırma

### 1. Repoyu Klonla
```bash
git clone https://github.com/sudenurarslan/EleganceBeautyBookingSystem.git
cd EleganceBeautyBookingSystem
```

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Veritabanı Bağlantısını Yapılandır

Bir `.env` dosyası oluştur ve şu örneğe göre doldur:
```env
DB_HOST=containers-us-west-XXX.railway.app
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=railway
```

Ayrıca `config/db.js` dosyası environment değişkenlerini kullanacak şekilde ayarlanmış olmalıdır.

### 4. Veritabanı Tablolarını Oluştur

Eğer `schema.sql` dosyan varsa, Railway paneline bağlanarak bu dosyayı çalıştırabilirsin. Dilersen DBeaver gibi bir GUI aracı da kullanabilirsin.

### 5. Uygulamayı Başlat
```bash
npm start
```

Tarayıcıda aç:  
👉 `http://localhost:3000`

---

## 📂 Klasör Yapısı
```
EleganceBeautyBookingSystem/
├── public/             → CSS, JS ve görseller
├── routes/             → Express route dosyaları
├── views/              → Sayfa şablonları (EJS veya HTML)
├── config/             → Veritabanı ayarları
├── server.js           → Ana giriş noktası
├── .env                → Ortam değişkenleri
└── package.json
```

---

## 👩‍💻 Geliştirici

**Sudenur Arslan**  
📧 sudenurarslan13@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/sudenur-arslan-2bbb71248)  
🔗 [GitHub](https://github.com/sudenurarslan)

---

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
