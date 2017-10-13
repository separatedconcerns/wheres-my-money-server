const functions = require('firebase-functions');
const admin = require('./apiClients/firebaseClient.js');

const getTransactionsFromDatabase = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  admin.database()
    .ref(`users/${uniqueUserId}`)
    .once('value')
    .then((snapshot) => {
      const vals = snapshot.val();
      return {
        datesToSchedule: vals.datesToSchedule,
        itemIds: Object.keys(vals.items),
      };
    })
    .then((payload) => {
      let allTransactions = {};
      const db = admin.database();
      const lastDate = payload.datesToSchedule[payload.datesToSchedule.length - 1];
      payload.itemIds.forEach((itemId) => {
        db.ref(`items/${itemId}/transactions`)
          .once('value')
          .then((snapshot) => {
            const transactions = snapshot.val();
            payload.datesToSchedule.forEach((date) => {
              allTransactions = Object.assign(allTransactions, transactions[date]);
              if (date === lastDate) {
                console.log(Object.keys(allTransactions));
                response.json(allTransactions);
              }
            });
          });
      });
    });
});

module.exports = getTransactionsFromDatabase;
