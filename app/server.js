// content of index.js
const fs = require('fs');
const http = require('http')
const port = 3006
const bittrex = require('node.bittrex.api')
const { API_KEY, API_SECRET } = require('./app.conf')

bittrex.options({
  'apikey':    API_KEY,
  'apisecret': API_SECRET
});

const combineBittrexInfo = (resolve, reject) => {
  bittrex.getbalances( ( data, err ) => {
    const records = []
    const hodlings = data.result.filter((hodl) => {
      return hodl.Balance > 0
    })

    hodlings.forEach((item, index) => {
      // item:  { Currency: 'BCC',
      //   Balance: 3.4e-7,
      //   Available: 3.4e-7,
      //   Pending: 0,
      //   CryptoAddress: null }
      if (item.Currency === 'BTC') {
        records.push({
          name: item.Currency,
          balance: item.Balance,
          currentPrice: 1 // 1 BTC worth 1 BTC
        })
      } else {
        bittrex.getmarketsummary({market: `BTC-${item.Currency}`}, (summary) => {
          // summary:  { success: true,
          //   message: '',
          //   result:
          //    [ { MarketName: 'BTC-BCC',
          //        High: 0.12,
          //        Low: 0.112,
          //        Volume: 26303.07091572,
          //        Last: 0.11436,
          //        BaseVolume: 3048.22418422,
          //        TimeStamp: '2017-09-26T00:07:28.16',
          //        Bid: 0.11436,
          //        Ask: 0.11479,
          //        OpenBuyOrders: 2815,
          //        OpenSellOrders: 14037,
          //        PrevDay: 0.11460007,
          //        Created: '2017-08-01T18:34:04.967' } ] }
          records.push({
            name: item.Currency,
            balance: item.Balance,
            currentPrice: summary ? summary.result[0].Last : null
          })

          if (records.length === hodlings.length) {
            resolve(records)
          }
        })
      }
    })
  })
}

const getBittrexOrders = (balances, resolve, reject) => {
  const records = {}

  balances.forEach((balance, index) => {
    let market = `BTC-${balance.name}`

    if (market !== 'BTC-BTC') {
      bittrex.getorderhistory({ market }, (data, err) => {
        // {
        //   "OrderUuid": "4223cb31-6083-4d09-8ab9-c22acee67dfe",
        //   "Exchange": "BTC-ETH",
        //   "TimeStamp": "2017-09-25T00:58:55.513",
        //   "OrderType": "LIMIT_BUY",
        //   "Limit": 0.07703706,
        //   "Quantity": 1.54634107,
        //   "QuantityRemaining": 0,
        //   "Commission": 0.00029779,
        //   "Price": 0.11912554,
        //   "PricePerUnit": 0.07703704,
        //   "IsConditional": false,
        //   "Condition": "NONE",
        //   "ConditionTarget": null,
        //   "ImmediateOrCancel": false,
        //   "Closed": "2017-09-25T01:02:38.687"
        // },
        records[balance.name] = data.result

        if (Object.keys(records).length === balances.length - 1) {
          resolve(records)
        }
      })
    }
  })
}


// @TODO probably use express or something since you don't know what you
// are doing...
const requestHandler = (req, res) => {
  console.log(req.url)

  // Sync bittrex.json with real data
  if (req.url === '/api/sync') {
    const getBalances = new Promise(combineBittrexInfo)

    getBalances.then((balances) => {
      const fetchOrders = new Promise((resolve, reject) => getBittrexOrders(balances, resolve, reject))

      fetchOrders.then((orders) => {
        fs.writeFile(`${__dirname}/../public/bittrex.json`, JSON.stringify({ hodlings: balances, orders }), function(err) {
          if(err) {
            res.write(JSON.stringify({msg: 'Failed to write bittrex.json', status: 'error'}))
            return console.log(err);
          }
          res.writeHead(200, {'Content-Type': 'text/json'});
          res.write(JSON.stringify({msg: 'Fetched records from bittrex and updated bittrex.json', status: 'success'}))
          console.log("The file was saved!")
          res.end()
        })
      })
    })
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write('<html>');
    res.write('<body>');
    res.write('<h1>404</h1>');
    res.write('</body>');
    res.write('</html>');
    res.end()
  }

  // bittrex test
  // bittrex.getmarkets( function( data, err ) {
  //   if (err) {
  //     return console.error(err)
  //   }
  //   console.log(data.result[0].MarketCurrency)
  //
  //   for( let i in data.result ) {
  //     // bittrex.getticker( { market : data.result[i].MarketName }, function( ticker ) {
  //     //   console.log( ticker )
  //     // })
  //   }
  // })

}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
