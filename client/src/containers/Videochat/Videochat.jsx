import React, { Component } from 'react';
import Peer from 'simple-peer';

let socket;

export default class Videochat extends Component {
  constructor(props) {
    super(props);
    socket = this.props.socket;
    this.state = {
      ownPeer: '',
      peers: []
    }

    socket.on('connectToPeer', data => {
      this.updatePeer();

      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true, }).then(stream => {
        var video = document.createElement("video");

        let peer = new Peer({
          initiator: false,
          trickle: false,
          stream
        });

        peer.signal(JSON.parse(data.peer));

        peer.on('signal', peer => {
          if (peer.renegotiate) return
          peer = JSON.stringify(peer)
          socket.emit('finalHandshake', { peer, index: data.index, socket: data.socket })
        })

        peer.on('stream', stream => {
          document.querySelector('#videos').appendChild(video)
          video.srcObject = stream;
          video.onloadedmetadata = function (e) {
            video.play();
          };
        })

        peer.on('close', () => {
          video.remove();
        })
      })
    })

    socket.on('finalHandshake', data => {
      const peer = this.state.peers[data.index];
      peer.signal(JSON.parse(data.peer));

      peer.on('stream', stream => {
        var video = document.createElement("video");
        document.querySelector('#videos').appendChild(video)
        video.srcObject = stream;
        video.onloadedmetadata = function (e) {
          video.play();
        };
      })

      this.updatePeer()
    })
  }

  componentDidMount() {
    // this.startPeer();
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false, }).then(stream => {
      const video = document.querySelector('#ownVideo')
      video.srcObject = stream;
      video.play()
    })

    socket.emit('addUser', {}, () => {
      this.getAllUsers()
    })
  }

  startPeer() {
    // navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false, }).then(stream => {
    //   const video = document.querySelector('#ownVideo')
    //   video.srcObject = stream;
    //   video.play()

    //   let peer = new Peer({
    //     initiator: true,
    //     trickle: false,
    //     stream
    //   });

    //   this.addPeerToPeers(peer).then(index => {
    //     this.state.peers[index].on('signal', data => {
    //       data = JSON.stringify(data);

    // this.setState({ ownPeer: data })
    // socket.emit('addUser', { peer: data, index }, group => {
    //   this.getAllUsers(group, data);
    // })
    //     })
    //   })
    // })
  }

  getAllUsers() {
    socket.emit('getAllUsers', group => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true, }).then(stream => {

        group.users.forEach(user => {
          // DO NOT CONNECT WITH YOURSELF
          if (user.socketId === socket.id) return;
          let peer = new Peer({
            initiator: true,
            trickle: false,
            stream
          });

          this.addPeerToPeers(peer).then(index => {
            this.state.peers[index].on('signal', data => {
              let peerId = JSON.stringify(data);

              this.setState({ ownPeer: peerId })
              socket.emit('connectToPeer', { peer: peerId, index, socket: user.socketId })
            })
          })
        })
      })

      if(group.users.length === 1) {
        this.updatePeer();
      }
    })
  }

  addPeerToPeers(peer) {
    return new Promise(resolve => {

      let peers = this.state.peers;
      peers.push(peer);
      this.setState({ peers }, () => {
        resolve(peers.length - 1);
      })
    })
  }

  updatePeer() {
    this.setState({ ownPeer: "Loading.." })
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true, }).then(stream => {
      let peer = new Peer({
        initiator: true,
        trickle: false,
        stream
      });
      this.addPeerToPeers(peer).then(index => {
        this.state.peers[index].on('signal', data => {
          data = JSON.stringify(data);
          this.setState({ ownPeer: data })
          socket.emit('updateUser', { peer: data, index })
        })
      })
    })
  }

  render() {
    return (
      <div>
        ownPeer: {this.state.ownPeer ? <textarea value={this.state.ownPeer} disabled></textarea> : 'Loading..'}
        < div id="videos" >
          <video id="ownVideo"></video>
        </div >
      </div >
    )
  }
}
