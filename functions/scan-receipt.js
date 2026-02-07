const axios = require('axios');
const { MongoClient } = require('mongodb');

// Inisialisasi MongoDB Client di luar handler untuk efisiensi
const client = new MongoClient(process.env.MONGODB_URI);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    let { image } = JSON.parse(event.body);
    const apiKey = process.env.OCR_API_KEY;

    if (image.includes(',')) image = image.split(',')[1];

    const formData = new URLSearchParams();
    formData.append('base64Image', `data:image/jpg;base64,${image}`);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng'); // Stabil untuk angka

    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000
    });

    if (!response.data?.ParsedResults?.[0]) {
      return { statusCode: 422, body: JSON.stringify({ error: "Gagal membaca struk." }) };
    }

    const text = response.data.ParsedResults[0].ParsedText.toLowerCase();

    // --- 1. LOGIC REGEX YANG LEBIH RAPI ---
    // Mencari angka yang biasanya didahului kata kunci 'total', 'amount', atau 'rp'
    // Jika tidak ketemu, baru ambil angka terbesar yang masuk akal (di bawah 10jt misalnya)
    const totalMatch = text.match(/(total|amount|grand total|rp|nett)\s*[:=]?\s*([\d.,]+)/);
    let amount = 0;

    if (totalMatch) {
      amount = parseInt(totalMatch[2].replace(/[^0-9]/g, ''));
    } else {
      const allAmounts = text.match(/\d+[\d.,]*/g) || [];
      const cleanAmounts = allAmounts
        .map(a => parseInt(a.replace(/[^0-9]/g, '')))
        .filter(a => a >= 1000 && a < 5000000); // Filter: abaikan NPWP (>10jt) atau receh (<1rb)
      amount = cleanAmounts.length > 0 ? Math.max(...cleanAmounts) : 0;
    }

    // --- 2. KATEGORISASI ---
    let category = "Lainnya";
    const keywords = {
      "Makanan": ["resto", "cafe", "food", "coffee", "neo arcade", "bakery", "makan", "warkop"],
      "Belanja": ["indomaret", "alfamart", "supermarket", "mall", "serpong", "tokopedia", "shopee"],
      "Transportasi": ["gojek", "grab", "pertamina", "shell", "parkir", "tol", "bluebird"],
    };

    for (const [cat, keys] of Object.entries(keywords)) {
      if (keys.some(key => text.includes(key))) {
        category = cat;
        break;
      }
    }

    // --- 3. SIMPAN KE MONGODB ---
    const newData = {
      amount,
      category,
      date: new Date(), // Simpan waktu saat ini
      note: "Auto-scan: " + text.substring(0, 30).replace(/\r?\n|\r/g, " "),
      source: "OCR Scan"
    };

    await client.connect();
    const database = client.db('finance_db'); // Ganti dengan nama DB-mu
    const collection = database.collection('transactions'); // Ganti dengan nama collection-mu
    await collection.insertOne(newData);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: "Berhasil disimpan ke Database!",
        data: newData 
      })
    };

  } catch (e) {
    console.error("Error Detail:", e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};