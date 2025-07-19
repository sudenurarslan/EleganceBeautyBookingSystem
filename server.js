const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'elegance_beauty_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL bağlantı hatası:', err);
  } else {
    console.log('✅ MySQL veritabanına bağlanıldı.');
  }
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static('uploads'));

app.use(express.static('public'));


app.get('/api/services', (req, res) => {
  const sql = 'SELECT * FROM services';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Servisler alınamadı:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.json(results);
  });
});


app.get("/api/specialists", (req, res) => {
  const sql = "SELECT * FROM specialists";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(result);
  });
});
function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


  return regex.test(email);
}




app.post('/api/register', (req, res) => {
  const { name, email, phone, password } = req.body;

  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz.' });
  }

  const sql = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, phone, password], (err, result) => {
    if (err) {
      console.error('Kayıt hatası:', err);
      return res.status(500).json({ error: 'Kayıt işlemi başarısız' });
    }
    res.json({ message: 'Kayıt başarılı' });
  });
});


app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (results.length > 0) return res.json({ message: 'Giriş başarılı' });
    else return res.status(401).json({ error: 'Geçersiz email veya şifre' });
  });
});

app.post('/api/specialistLogin', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM specialists WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    if (results.length > 0) res.json(results[0]);
    else res.status(401).json({ error: 'Geçersiz giriş' });
  });
});



app.post('/api/appointments', (req, res) => {
  const { service_id, expert_id, user_email, date, time } = req.body;

  
  const durationSql = 'SELECT duration_minutes FROM services WHERE id = ?';
  db.query(durationSql, [service_id], (durErr, durResults) => {
    if (durErr || durResults.length === 0) {
      console.error('Süre alınamadı:', durErr);
      return res.status(500).json({ error: 'Hizmet süresi alınamadı' });
    }

    const duration = durResults[0].duration_minutes;
    const appointmentStart = new Date(`${date}T${time}`);
    const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);

    
    const conflictSql = `
      SELECT appointments.*, services.duration_minutes 
      FROM appointments 
      JOIN services ON appointments.service_id = services.id
      WHERE appointments.expert_id = ? AND appointments.date = ?
    `;

    db.query(conflictSql, [expert_id, date], (confErr, results) => {
      if (confErr) {
        console.error('Çakışma kontrol hatası:', confErr);
        return res.status(500).json({ error: 'Veritabanı hatası' });
      }

      
      const hasConflict = results.some(appt => {
        const apptStart = new Date(`${appt.date}T${appt.time}`);
        const apptEnd = new Date(apptStart.getTime() + appt.duration_minutes * 60000);

        
        return (
          (appointmentStart >= apptStart && appointmentStart < apptEnd) ||
          (appointmentEnd > apptStart && appointmentEnd <= apptEnd) ||
          (appointmentStart <= apptStart && appointmentEnd >= apptEnd)
        );
      });

      if (hasConflict) {
        return res.status(400).json({ 
          error: 'Bu zaman aralığında seçilen uzmanın başka bir randevusu bulunmaktadır.' 
        });
      }

      
      const insertSql = `
        INSERT INTO appointments (service_id, expert_id, user_email, date, time)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(insertSql, [service_id, expert_id, user_email, date, time], (insertErr, result) => {
        if (insertErr) {
          console.error('Ekleme hatası:', insertErr);
          return res.status(500).json({ error: 'Randevu oluşturulamadı' });
        }

        res.status(200).json({ message: 'Randevu başarıyla oluşturuldu' });
      });
    });
  });
});







app.get('/api/appointments', (req, res) => {
  const { email } = req.query;
  const sql = 'SELECT * FROM appointments WHERE user_email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Randevular alınamadı:', err);
      return res.status(500).json({ error: 'Randevular getirilemedi' });
    }
    res.json(results);
  });
});

app.get('/api/userInfo', (req, res) => {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: 'E-posta eksik' });

  const sql = 'SELECT name FROM users WHERE email = ? LIMIT 1';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Kullanıcı bilgisi alınamadı:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ name: results[0].name });
  });
});


app.get('/api/appointments/specialist/:id', (req, res) => {
  const specialistId = req.params.id;
  const selectedDate = req.query.date;

  console.log(`Uzman ${specialistId} için ${selectedDate ? selectedDate : 'TÜM'} tarihli randevular sorgulanıyor`);

  const baseSql = `
    SELECT a.*, s.name AS service_name, s.duration_minutes
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.expert_id = ?
    ${selectedDate ? 'AND a.date = ?' : ''}
    ORDER BY a.date ASC, a.time ASC
  `;

  const params = selectedDate ? [specialistId, selectedDate] : [specialistId];

  db.query(baseSql, params, (err, results) => {
    if (err) {
      console.error('Uzman randevuları alınamadı:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }

    const appointments = results.map(appt => ({
      ...appt,
      date: appt.date instanceof Date ? appt.date.toISOString().split("T")[0] : appt.date,
      time: typeof appt.time === 'string' ? appt.time.slice(0, 5) : appt.time
    }));

    console.log("Döndürülen randevular:", appointments);
    res.json(appointments);
  });
});






app.post('/api/comments', (req, res) => {
  const { user_email, comment } = req.body;
  const sql = 'INSERT INTO comments (user_email, comment) VALUES (?, ?)';
  db.query(sql, [user_email, comment], (err, result) => {
    if (err) {
      console.error('Yorum ekleme hatası:', err);
      return res.status(500).json({ error: 'Yorum gönderilemedi' });
    }
    res.json({ message: 'Yorum başarıyla gönderildi' });
  });
});
app.get("/api/bookedDates", (req, res) => {
  const query = `
    SELECT date FROM appointments
    GROUP BY date
    HAVING COUNT(*) >= 8
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Booked dates error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const bookedDates = results.map(row => row.date.toISOString().split("T")[0]);
    res.json(bookedDates);
  });
});

app.get("/api/bookedTimes", (req, res) => {
  const selectedDate = req.query.date;

  if (!selectedDate) {
    return res.status(400).json({ error: "Missing date parameter" });
  }

  const query = "SELECT time FROM appointments WHERE date = ?";
  db.query(query, [selectedDate], (err, results) => {
    if (err) {
      console.error("Booked times error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const bookedTimes = results.map(row => row.time.slice(0, 5)); // "HH:mm"
    res.json(bookedTimes);
  });
});
app.delete('/api/appointments/:id', (req, res) => {
  const appointmentId = req.params.id;
  const sql = `DELETE FROM appointments WHERE id = ?`;

  db.query(sql, [appointmentId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Silme işlemi sırasında hata oluştu.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Randevu bulunamadı.' });
    }
    res.json({ message: 'Randevu başarıyla iptal edildi.' });
  });
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
});
