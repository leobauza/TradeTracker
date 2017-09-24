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
      bittrex.getmarketsummary({market: `BTC-${item.Currency}`}, (summary) => {
        records.push({
          name: item.Currency,
          balance: item.Balance,
          currentPrice: summary ? summary.result[0].Last : item.Balance // BTC is itself...
        })

        if (records.length === hodlings.length) {
          resolve(records)
        }
      })
    })
  })
}


// @TODO probably use express or something since you don't know what you
// are doing...
const requestHandler = (req, res) => {
  console.log(req.url)

  // Sync bittrex.json with real data
  if (req.url === '/api/sync') {
    const fetchRecords = new Promise(combineBittrexInfo)

    fetchRecords.then((records) => {
      fs.writeFile(`${__dirname}/../public/bittrex.json`, JSON.stringify(records), function(err) {
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
