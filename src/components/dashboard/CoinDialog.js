import React, { Component } from 'react'
import Dialog from 'material-ui/Dialog'
import Number from '../common/number'

export default class CoinDialog extends Component {
  renderCoinOrders(order, index) {
    console.log(order)
    const { OrderType, PricePerUnit, Quantity } = order

    const type = OrderType === 'LIMIT_BUY' ? 'Buy' : 'Sell'

    return (
      <ul key={index}>
        <li><strong>{type}:</strong> <Number num={parseFloat(Quantity)} type='amount' /> at <Number num={parseFloat(PricePerUnit)} /> per unit</li>
      </ul>
    )
  }

  renderSelectedOrders(coin) {
    if (!coin || !coin.orders) {
      return (
        <p>There are no orders to display.</p>
      )
    }

    return (
      <div>
        {coin.orders.map((order, index) => this.renderCoinOrders(order, index))}
      </div>
    )
  }

  render() {

    const { handleCloseRequest, open, coin} = this.props

    return (
      <Dialog
        title={`Orders for ${coin && coin.name}`}
        // actions={actions}
        modal={false}
        open={open}
        onRequestClose={handleCloseRequest}
        autoScrollBodyContent={true}
      >
        {this.renderSelectedOrders(coin)}
      </Dialog>
    )
  }
}

CoinDialog.defaultProps = {
  coin: {},
  handleCloseRequest: () => {},
  open: false
}
