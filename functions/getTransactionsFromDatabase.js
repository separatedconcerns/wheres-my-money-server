const functions = require('firebase-functions');
const user = require('./controllers/userController');
const item = require('./controllers/itemController');

const getTransactionsFromDatabase = functions.https.onRequest((request, response) => {
  response.header('Access-Control-Allow-Origin', '*');
  const uniqueUserId = request.body.uniqueUserId;
  user.getUserFromDB(uniqueUserId)
    .then((userData) => {
      return {
        datesToSchedule: userData.datesToSchedule,
        itemIds: Object.keys(userData.items),
      };
    })
    .then((payload) => {
      let allTransactions = {};
      const lastItemId = payload.itemIds[payload.itemIds.length - 1];
      const lastDate = payload.datesToSchedule[payload.datesToSchedule.length - 1];
      payload.itemIds.forEach((itemId) => {
        item.getItemTransactionsFromDB(itemId)
          .then((transactions) => {
            payload.datesToSchedule.forEach((date) => {
              const mergeObj = Object.assign(allTransactions, transactions[date] || {});
              allTransactions = mergeObj;
              if (itemId === lastItemId && date === lastDate) {
                response.json(allTransactions);
              }
            });
          });
      });
    });
});

module.exports = getTransactionsFromDatabase;
