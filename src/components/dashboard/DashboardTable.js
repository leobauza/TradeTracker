import React, { Component } from 'react'
import Number from '../common/number'
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

    return perc
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

    const currentPercentage = this.calcCurrentPerc(row.balance * row.currentPrice)

    return (
      <TableRow key={index}>
        {this.renderCol(row.name, 'left')}
        {this.renderCol(
          <Number num={row.balance} type="currency"/>
        )}

        {/* {this.renderCol(row.target)} */}

        {this.renderCol(
          <Number num={currentPercentage} type="%" />,
          'right'
        )}

        {this.renderCol(
          <Number num={row.currentPrice} />
        )}

        {this.renderCol(
          <Number num={row.balance * row.currentPrice} />
        )}

        {/* {this.renderCol(row.purchaseValue)} */}

        {/* {this.renderCol(row.hodlReturn)} */}
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
            {/* <TableHeaderColumn style={{textAlign: 'right'}}>Purchase Price</TableHeaderColumn> */}
            {/* <TableHeaderColumn style={{textAlign: 'right'}}>Hodl Would Return %</TableHeaderColumn> */}
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
