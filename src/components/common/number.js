import React from 'react'
import './common.css'

const Num = ({ num, type }) => {
  switch (type) {
    case '%':
      return (
        <span className="number">{num.toFixed(2)}%</span>
      )

    case 'currency':
      return (
        <span className="number">{num.toFixed(8)}</span>
      )

    default:
      return (
        <span className="number">
          {num.toFixed(8)} {type}
        </span>
      )
  }
}

Num.defaultProps = {
  num: 0,
  type: 'BTC'
}

export default Num
