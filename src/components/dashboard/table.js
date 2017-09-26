import React, { Component } from 'react'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table'

export default class DashboardTable extends Component {

  calcCurrentPerc(val) {
    const { data } = this.props

    const totalCurrentValue = data.reduce((sum, next) => {
      return sum + (next.balance * next.currentPrice)
    }, 0)

    const perc = (val/totalCurrentValue) * 100

    return perc.toFixed(2)
  }

  col(content, align = 'right') {

    const styles = {
      textAlign: align,
      fontFamily: !isNaN(parseFloat(content)) && isFinite(content) ? 'Roboto Mono, monospace' : 'Roboto, sans-serif'
    }

    return(
      <TableRowColumn style={ styles }>{content}</TableRowColumn>
    )
  }

  row(row, index) {

    if (row.balance < .000001) {
      return
    }

    return (
      <TableRow key={index}>
        {this.col(row.name, 'left')}
        {this.col(row.balance.toPrecision(8))}
        {/* {this.col(row.target)} */}
        {this.col(this.calcCurrentPerc(row.balance * row.currentPrice), 'right')}
        {this.col(row.currentPrice.toFixed(8))}
        {this.col((row.balance * row.currentPrice).toFixed(8))}
        {/* {this.col(row.purchaseValue)} */}
        {/* {this.col(row.hodlReturn)} */}
      </TableRow>
    )
  }

  render() {

    const { data } = this.props

    return(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn style={{textAlign: 'left'}}>Name</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: 'right'}}>Hodl</TableHeaderColumn>
            {/* <TableHeaderColumn style={{textAlign: 'right'}}>Target %</TableHeaderColumn> */}
            <TableHeaderColumn style={{textAlign: 'right'}}>% of Total</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: 'right'}}>Unit Value</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: 'right'}}>Current Value</TableHeaderColumn>
            {/* <TableHeaderColumn style={{textAlign: 'right'}}>Purchase Price</TableHeaderColumn> */}
            {/* <TableHeaderColumn style={{textAlign: 'right'}}>Hodl Would Return %</TableHeaderColumn> */}
          </TableRow>
        </TableHeader>

        {/* name: item.Currency,
        balance: item.Balance,
        currentPrice: summary ? summary.result[0].Last : item.Balance // BTC is itself... */}


        <TableBody>
          {data.map( (row, index) => (
            this.row(row, index)
          ))}
        </TableBody>
      </Table>
    )
  }
}

DashboardTable.defaultProps = {
  data: []
}
