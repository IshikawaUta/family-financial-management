const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  if (!user) return { statusCode: 401, body: "Unauthorized" };

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('finance_db');
    const data = await db.collection('transactions')
                         .find({ user_email: user.email })
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