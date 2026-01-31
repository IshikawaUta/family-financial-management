const { MongoClient } = require('mongodb');
const sgMail = require('@sendgrid/mail');

// Konfigurasi SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };
  
  const { user } = context.clientContext;
  if (!user) return { statusCode: 401 };

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    const data = JSON.parse(event.body);
    const amount = parseInt(data.amount);
    const type = data.type; // 'income' atau 'expense'
    
    // Format mata uang Rupiah untuk di email
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);

    await client.connect();
    const db = client.db('finance_db');
    
    const doc = {
      user_email: user.email,
      description: data.description,
      amount: amount,
      type: type,
      category: data.category,
      date: new Date().toISOString()
    };

    // 1. Simpan ke Database
    await db.collection('transactions').insertOne(doc);

    // 2. Kirim Notifikasi Email
    const accentColor = type === 'income' ? '#10b981' : '#ef4444'; // Hijau vs Merah
    const typeLabel = type === 'income' ? 'Pemasukan' : 'Pengeluaran';

    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM, 
      subject: `[FinFamily] Notifikasi ${typeLabel} Baru`,
      html: `
        <div style="background-color: #f8fafc; padding: 40px 10px; font-family: 'Segoe UI', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            
            <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">FinFamily</h1>
            </div>

            <div style="padding: 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; padding: 6px 16px; background-color: ${accentColor}15; color: ${accentColor}; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                  ${typeLabel} Tercatat
                </div>
                <h2 style="color: #1e293b; margin-top: 15px; font-size: 32px; font-weight: 800;">${formattedAmount}</h2>
                <p style="color: #64748b; font-size: 16px; margin-top: 5px;">${doc.description}</p>
              </div>

              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px;">
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="color: #64748b; padding-bottom: 12px;">Kategori</td>
                    <td style="text-align: right; color: #1e293b; font-weight: 600; padding-bottom: 12px;">${doc.category}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding-bottom: 12px;">Tanggal</td>
                    <td style="text-align: right; color: #1e293b; font-weight: 600; padding-bottom: 12px;">${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="color: #64748b; padding-top: 12px;">Status</td>
                    <td style="text-align: right; color: #10b981; font-weight: 600; padding-top: 12px;">Berhasil Disimpan</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.URL || 'https://finfamily.netlify.app'}" 
                   style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                   Lihat Dashboard
                </a>
              </div>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Email ini dikirim otomatis oleh sistem FinFamily.</p>
            </div>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    return { 
      statusCode: 201, 
      body: JSON.stringify({ message: "Success", data: doc }) 
    };

  } catch (error) {
    console.error("Error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  } finally {
    await client.close();
  }
};