const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  if (!user) return { statusCode: 401, body: "Unauthorized" };

  // Ambil parameter bulan dari query string (format: YYYY-MM)
  const selectedMonth = event.queryStringParameters && event.queryStringParameters.month;

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('finance_db');
    
    // Filter dasar berdasarkan email user
    let query = { user_email: user.email };
    
    // Jika ada parameter bulan, tambahkan filter regex
    if (selectedMonth && selectedMonth !== "") {
      query.date = { $regex: `^${selectedMonth}` };
    }

    const data = await db.collection('transactions')
                         .find(query)
                         .sort({ date: -1 }).toArray();
    
    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data) 
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  } finally {
    await client.close();
  }
};