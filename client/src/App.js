import React from 'react'

const App = () => {

  const sendMessage = () => {

  }
  
  return (
    <div className="app">
      <input type="text" placeholder="Message..." />
      <button onClick={sendMessage}>Send Message</button>
    </div>
  )
}

export default App