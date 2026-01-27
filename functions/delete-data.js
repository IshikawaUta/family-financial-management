const { MongoClient, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
  if (event.httpMethod !== "DELETE") return { statusCode: 405 };
  const { user } = context.clientContext;
  if (!user) return { statusCode: 401 };

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    const { id } = event.queryStringParameters;
    await client.connect();
    const db = client.db('finance_db');
    
    await db.collection('transactions').deleteOne({ 
      _id: new ObjectId(id), 
      user_email: user.email 
    });
    
    return { statusCode: 200, body: "Deleted" };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  } finally {
    await client.close();
  }
};