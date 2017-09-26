import React, { Component } from 'react'
import './App.css'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import DashboardTable from './components/dashboard/DashboardTable'
import CoinDialog from './components/dashboard/CoinDialog'

/**
 * @TODO
 * - add a button to sync with bittrex (`/api/sync`)
 */

class App extends Component {
  constructor() {
    super()

    this.state = {
      data: [],
      coinDialogOpen: false,
      selectedRowIndex: null,
      total: 0
    }
  }

  toggleCoinDialog = index => {
    this.setState({
      coinDialogOpen: !this.state.coinDialogOpen,
      selectedRowIndex: index ? index : null
    })
  }

  componentDidMount() {
    this.loadBittrexJson()
  }

  loadBittrexJson() {
    fetch('bittrex.json', {
      method: 'get'
    })
      .then(res => {
        res.json().then(json => {
          const { hodlings, orders } = json

          // Combine hodlings and orders
          const hodlingsWithOrders = hodlings.map(hodl => {
            return {
              orders: orders[hodl.name],
              ...hodl
            }
          })

          this.setState({
            data: hodlingsWithOrders,
            total: hodlings
              .reduce((sum, next) => {
                return sum + next.balance * next.currentPrice
              }, 0)
              .toPrecision(8)
          })
        })
      })
      .catch(err => {
        console.error(err)
      })
  }

  render() {
    const { data, total, coinDialogOpen, selectedRowIndex } = this.state
    const selectedCoin = data && data[selectedRowIndex]

    return (
      <MuiThemeProvider>
        <div className="App">
          <DashboardTable
            handleRowSelection={this.toggleCoinDialog}
            data={data}
          />

          <CoinDialog
            coin={selectedCoin}
            open={coinDialogOpen}
            handleCloseRequest={this.toggleCoinDialog}
          />

          <p className="total">
            <strong>Total:</strong> <span>{total}</span> BTC
          </p>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
