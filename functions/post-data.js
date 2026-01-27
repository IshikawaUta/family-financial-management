const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };
  const { user } = context.clientContext;
  if (!user) return { statusCode: 401 };

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    const data = JSON.parse(event.body);
    await client.connect();
    const db = client.db('finance_db');
    
    const doc = {
      user_email: user.email,
      description: data.description,
      amount: parseInt(data.amount),
      type: data.type,
      category: data.category,
      date: new Date().toISOString()
    };

    await db.collection('transactions').insertOne(doc);
    return { statusCode: 201, body: "Success" };
  } finally {
    await client.close();
  }
};