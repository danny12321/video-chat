import React, { Component } from 'react';
import './App.css';
import Peer from 'simple-peer';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      peer: new Peer({
        initiator: window.confirm("Are you the initiator?"),
        trickle: false
      }),
      peerId: '',
      messages: []
    }


    this.state.peer.on('signal', data => {
      this.setState({ peerId: JSON.stringify(data) })
    })

    this.state.peer.on('data', message => {
      let messages = this.state.messages;
      var uint8array = new TextEncoder("utf-8").encode(message);
      messages.push(new TextDecoder("utf-8").decode(uint8array));
      this.setState({ messages })
    })
  }

  connect(e) {
    e.preventDefault()
    this.state.peer.signal(JSON.parse(e.target.peer.value))
  }

  sendMessage(e) {
    e.preventDefault()
    this.state.peer.send(JSON.stringify(e.target.message.value))
    let messages = this.state.messages;
    messages.push(e.target.message.value);
    this.setState({ messages })
  }

  render() {

    return (
      <div className="App">
        peer: <textarea value={this.state.peerId}></textarea>


        <form onSubmit={this.connect.bind(this)}>
          Connect to:
          <textarea type="text" name="peer"></textarea>
          <button type="submit">Connect</button>
        </form>


        <form onSubmit={this.sendMessage.bind(this)}>
          Send message:
          <input type="text" name="message" />
          <button type="submit">send</button>
        </form>

        {this.state.messages.map(message => {
          return (<p>{message}</p>)
        })}
      </div>
    );
  }
}

export default App;
