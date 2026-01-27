const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  if (!user) return { statusCode: 401, body: "Unauthorized" };

  const year = (event.queryStringParameters && event.queryStringParameters.year) || new Date().getFullYear().toString();
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('finance_db');
    
    // Agregasi untuk mendapatkan total per tipe (income/expense) dan per bulan
    const summary = await db.collection('transactions').aggregate([
      { 
        $match: { 
          user_email: user.email, 
          date: { $regex: `^${year}` } 
        } 
      },
      {
        $facet: {
          "totals": [
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
          ],
          "monthlyExpense": [
            { $match: { type: "expense" } },
            { $group: { _id: { $substr: ["$date", 5, 2] }, total: { $sum: "$amount" } } },
            { $sort: { "_id": 1 } }
          ]
        }
      }
    ]).toArray();

    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(summary[0]) 
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  } finally {
    await client.close();
  }
};