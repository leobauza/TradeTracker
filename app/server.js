// content of index.js
const fs = require('fs');
const http = require('http')
const csv = require('csv')
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
      const market = `BTC-${item.Currency}`

      // item:  {
      //   Currency: 'BCC',
      //   Balance: 3.4e-7,
      //   Available: 3.4e-7,
      //   Pending: 0,
      //   CryptoAddress: null
      // }
      if (market === 'BTC-BTC') {
        records.push({
          name: item.Currency,
          balance: item.Balance,
          currentPrice: 1 // 1 BTC worth 1 BTC
        })
      } else {
        bittrex.getmarketsummary({market}, (summary) => {
          // summary:  {
          //   success: true,
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
          //        Created: '2017-08-01T18:34:04.967' } ]
          // }
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

const writeCsvData = () => {
  const csvOrders = {}

  fs.readFile(`${__dirname}/../orders.csv`, 'utf8', (err, fileData) => {
    if (err) throw err

    csv.parse(fileData, (err, csvData) => {
      // example csv data
      // Closed Date,Opened Date,Market,Type,Bid/Ask,Units Filled,Units Total,Actual Rate,Cost / Proceeds
      // 09/26/2017 08:37:09 AM,09/26/2017 08:36:25 AM,BTC-DCR,Limit Sell,0.00879001,3.21655376,3.21655376,0.00879,0.02820285
      csvData.forEach((row, index) => {
        if (index !== 0) {
          let marketName = row[2].replace('BTC-', '')
          csvOrders[marketName] = csvOrders[marketName] || []
          csvOrders[marketName].push(
            // match the API order format
            {
              "OrderUuid": null,
              "Exchange": row[2],
              "TimeStamp": row[0],
              "OrderType": row[3].replace(' ', '_').toUpperCase(),
              "Limit": row[4],
              "Quantity": row[6],
              "QuantityRemaining": null,
              "Commission": null,
              "Price": row[8],
              "PricePerUnit": row[7],
              "IsConditional": null,
              "Condition": null,
              "ConditionTarget": null,
              "ImmediateOrCancel": null,
              "Closed": row[0]
            }
          )
        }
      })

      fs.writeFile(`${__dirname}/../public/bittrex.json`, JSON.stringify({ orders: csvOrders }), function(err) {
        if(err) {
          res.write(JSON.stringify({msg: 'Failed to write bittrex.json', status: 'error'}))
          return console.log(err);
        }
      })
    })
  })
}

const appendApiData = () => {
  const getBalances = new Promise(combineBittrexInfo)

  getBalances.then((balances) => {
    const fetchOrders = new Promise((resolve, reject) => getBittrexOrders(balances, resolve, reject))

    fetchOrders.then((apiOrders) => {
      fs.readFile(`${__dirname}/../public/bittrex.json`, 'utf8', (err, csvOrders) => {
        let bittrexCsvOrders = JSON.parse(csvOrders).orders

        Object.keys(apiOrders).forEach((marketName) => {
          apiOrders[marketName].forEach((order) => {
            bittrexCsvOrders[marketName] = bittrexCsvOrders[marketName] || []
            let matchingOrder = bittrexCsvOrders[marketName].find((o) => {
              return new Date(o.TimeStamp).setHours(0,0,0,0) == new Date(order.TimeStamp).setHours(0,0,0,0) && o.Quantity == order.Quantity
            })

            if (!matchingOrder) {
              bittrexCsvOrders[marketName].push(order)
            }
          })
        })

        fs.writeFile(`${__dirname}/../public/bittrex.json`, JSON.stringify({ hodlings: balances, orders: bittrexCsvOrders }), function(err) {
          if(err) {
            res.write(JSON.stringify({msg: 'Failed to write bittrex.json', status: 'error'}))
            return console.log(err);
          }
        })
      })
    })
  })
}


// @TODO probably use express or something since you don't know what you
// are doing...
const requestHandler = async (req, res) => {
  console.log(req.url)

  // Sync bittrex.json with real data
  if (req.url === '/api/sync') {
    await writeCsvData()
    await appendApiData()

    res.writeHead(200, {'Content-Type': 'text/json'});
    res.write(JSON.stringify({msg: 'Fetched records from bittrex and updated bittrex.json', status: 'success'}))
    console.log("The file was saved!")
    res.end()
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write('<html>');
    res.write('<body>');
    res.write('<h1>404</h1>');
    res.write('</body>');
    res.write('</html>');
    res.end()
  }
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
