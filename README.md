# TradeTracker `(0.1.0)`

A way to get the full picture of your Bittrex trades.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Getting set up

Copy `app.conf.sample.js` => `app.conf.js`

Replace the placeholder with your Bittrex API info:

> Add an API key at https://bittrex.com/Manage#sectionApi and make sure to only give READ INFO, unless you want to accidentally lose a bunch of money.

```js
module.exports = {
  API_KEY:    'YOUR-API-KEY',
  API_SECRET: 'YOUR-API-SECRET'
}
```

## Run the App

1. Start the server by running `node app/server.js` from `/`

2. Until the UI is built go to `http://localhost:3006/api/sync`. You should see a success message:
```
{
  msg: "Fetched records from bittrex and updated bittrex.json",
  status: "success"
}
```

3. Start the react app by running `yarn start`. You should see a table with all your hodlings and some numbers.

## WIP

1. Add a `sync` btn to eliminate step 2 above.

2. Add modals that pop up when a coin is clicked to reveal more detailed information

3. Fetch all buys/sells and calculate different data points based on that.

4. Graphs...so many graphs

## What is really dumb about this

1. Right now we are using a vanilla node server that fetches information from Bittrex and just saves a json document `public/bittrex.json`. That's obviously not gonna work long term.

2. See No. 1 because it's really dumb
