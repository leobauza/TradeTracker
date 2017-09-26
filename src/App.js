import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import DashboardTable from './components/dashboard/table'

/**
 * @TODO
 * - add a button to sync with bittrex (`/api/sync`)
 */

class App extends Component {

  constructor() {
    super()

    this.state = {
      data: [],
      total: 0
    }
  }

  componentDidMount() {
    this.loadBittrexJson()
  }

  loadBittrexJson() {
    fetch('bittrex.json', {
      method: 'get'
    }).then(res => {
      res.json().then((json) => {
        const hodlings = json.hodlings
        this.setState({
          data: hodlings,
          total: hodlings.reduce((sum, next) => {
            return sum + (next.balance * next.currentPrice)
          }, 0).toPrecision(8)
        })
      })
    }).catch(err => {
      console.error(err)
    })
  }

  render() {
    const { data, total } = this.state

    return (
      <div className="App">
        <MuiThemeProvider>
          <DashboardTable data={data} />
        </MuiThemeProvider>

        <p className="total"><strong>Total:</strong> <span>{total}</span> BTC</p>
      </div>
    );
  }
}

export default App;
