import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001')

const App = () => {

  const [message, setMessage] = useState('')
  const [messageReceived, setMessageReceived] = useState('')

  const sendMessage = () => {
    socket.emit('send_message', { message })
    setMessage('')
  }

  useEffect(() => {
    socket.on('receive_message', data => {
      setMessageReceived(data.message);
    })
  }, [socket])

  return (
    <div className="app">
      <input type="text" placeholder="Message..." value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send Message</button>
      <h1>Message: {messageReceived}</h1>
    </div>
  )
}

export default App