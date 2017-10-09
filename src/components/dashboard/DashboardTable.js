import React, { Component } from 'react'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table'

export default class DashboardTable extends Component {
  calcCurrentPerc(val) {
    const { data } = this.props

    const totalCurrentValue = data.reduce((sum, next) => {
      return sum + next.balance * next.currentPrice
    }, 0)

    const perc = val / totalCurrentValue * 100

    return perc.toFixed(2)
  }

  renderCol(content, align = 'right') {
    const styles = {
      textAlign: align,
      fontFamily:
        !isNaN(parseFloat(content)) && isFinite(content)
          ? 'Roboto Mono, monospace'
          : 'Roboto, sans-serif'
    }

    return <TableRowColumn style={styles}>{content}</TableRowColumn>
  }

  renderRow(row, index) {
    let mostRecentBuys = []
    let purchaseValue, currentValue, valueDifference, hodlWouldReturn

    if (row.orders) {
      for (let order of row.orders) {
        if (order.OrderType === "LIMIT_BUY") {
          mostRecentBuys = mostRecentBuys.concat(order)
        } else {
          break
        }
      }
    }

    purchaseValue = mostRecentBuys.reduce((total, buy) => {
      return total += Math.abs(buy.Price)
    }, 0.0)
    currentValue = (row.balance * row.currentPrice).toFixed(8)
    valueDifference = purchaseValue > 0 ? currentValue - purchaseValue : 0
    hodlWouldReturn = purchaseValue > 0 ? (currentValue / purchaseValue) - 1 : 0

    return (
      <TableRow key={index}>
        {this.renderCol(row.name, 'left')}
        {this.renderCol(row.balance.toPrecision(8))}
        {/* {this.renderCol(row.target)} */}
        {this.renderCol(
          this.calcCurrentPerc(row.balance * row.currentPrice),
          'right'
        )}
        {this.renderCol(row.currentPrice.toFixed(8))}
        {this.renderCol(currentValue)}
        {this.renderCol(purchaseValue)}
        {this.renderCol(valueDifference)}
        {this.renderCol(hodlWouldReturn)}
      </TableRow>
    )
  }

  render() {
    const { data, handleRowSelection } = this.props

    return (
      <Table onRowSelection={handleRowSelection}>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn style={{ textAlign: 'left' }}>
              Name
            </TableHeaderColumn>
            <TableHeaderColumn style={{ textAlign: 'right' }}>
              Hodl
            </TableHeaderColumn>
            {/* <TableHeaderColumn style={{textAlign: 'right'}}>Target %</TableHeaderColumn> */}
            <TableHeaderColumn style={{ textAlign: 'right' }}>
              % of Total
            </TableHeaderColumn>
            <TableHeaderColumn style={{ textAlign: 'right' }}>
              Unit Value
            </TableHeaderColumn>
            <TableHeaderColumn style={{ textAlign: 'right' }}>
              Current Value
            </TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: 'right'}}>
              Purchase Value
            </TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: 'right'}}>
              Value Difference
            </TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: 'right'}}>
              Hodl Would Return %
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>

        {/* name: item.Currency,
        balance: item.Balance,
        currentPrice: summary ? summary.result[0].Last : item.Balance // BTC is itself... */}

        <TableBody>
          {data.map((row, index) => this.renderRow(row, index))}
        </TableBody>
      </Table>
    )
  }
}

DashboardTable.defaultProps = {
  data: [],
  handleRowSelection: () => {}
}
