import React, { Component } from 'react'

export default class home extends Component {
  render() {
    return (
      <div>
        JA LETS GO
        <hr/>
        <button onClick={() => this.props.history.push('/videochat')}>Videochat</button>
      </div>
    )
  }
}
