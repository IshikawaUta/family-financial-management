const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  try {
    const { image } = JSON.parse(event.body);
    
    // Memanggil API Key dari Environment Variable
    const apiKey = process.env.OCR_API_KEY; 

    const formData = new URLSearchParams();
    formData.append('base64Image', image);
    formData.append('apikey', apiKey); // Menggunakan variabel sistem
    formData.append('language', 'ind');

    const response = await axios.post('https://api.ocr.space/parse/image', formData);
    const text = response.data.ParsedResults[0].ParsedText.toLowerCase();
    
    // --- Logika Ekstraksi & Kategori (sama seperti sebelumnya) ---
    const amounts = text.match(/\d+[\d.,]*/g) || [];
    const cleanAmounts = amounts
      .map(a => parseInt(a.replace(/[^0-9]/g, '')))
      .filter(a => a >= 1000);
    const totalEstimated = cleanAmounts.length > 0 ? Math.max(...cleanAmounts) : 0;

    let category = "Lainnya";
    const keywords = {
      "Makanan": ["resto", "warung", "makan", "bakso", "kopi", "cafe", "food", "mie"],
      "Transportasi": ["gojek", "grab", "pertamina", "bensin", "shell", "parkir", "tol"],
      "Belanja": ["indomaret", "alfamart", "supermarket", "mall", "shopee", "tokopedia", "fashion"],
      "Tagihan": ["listrik", "pdam", "wifi", "indihome", "asuransi", "bpjs"],
      "Kesehatan": ["apotek", "klinik", "rumah sakit", "obat", "dokter"]
    };

    for (const [cat, keys] of Object.entries(keywords)) {
      if (keys.some(key => text.includes(key))) {
        category = cat;
        break;
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" }, // Menambahkan header JSON
      body: JSON.stringify({ 
        amount: totalEstimated, 
        category: category 
      })
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};