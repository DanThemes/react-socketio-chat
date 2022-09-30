import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  autoConnect: false,

  // below is not (always) necessary ...
  withCredentials: true,
  transports: ['websocket']
})

const App = () => {

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('')
  const [messageReceived, setMessageReceived] = useState('')

  const selectUsername = () => {
    socket.auth = { username };
    console.log(username, socket.auth)
  }

  const joinRoom = () => {
    console.log(room);

    socket.connect();
    socket.emit('join_room', room);
  }

  const sendMessage = () => {
    if (selectedUser) {
      socket.emit('private_message', {
        message,
        to: selectedUser.userId
      })

      // setSelectedUser(prev => ({
      //   ...prev, 
      //   messages: [...prev.messages, { message, fromSelf: true }]
      // }))
      const newUsers = users.map(user => {
        if (user.userId === selectedUser.userId) {
          user.messages = [...user.messages, {message, fromSelf: false}];
        }
        return user;
      })
      setUsers(newUsers);
      console.log(newUsers);

    } else {
      socket.emit('send_message', { message, room })
    }
    setMessage('')
  }

  useEffect(() => {
    socket.on('receive_message', data => {
      setMessageReceived(data.message);
    })

    socket.on('private_message', ({message, from}) => {
      // alert('pm received: '+message+' from: '+from)
      setMessageReceived(message)
      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        if (user.userId === from) {
          const newUsers = users.map(user => {
            if (user.userId === from) {
              user.messages = [...user.messages, { message, fromSelf: false }];
            }
            if (user.userId !== selectedUser.userId) {
              user.hasNewMessages = true;
            }
          })
          setUsers(newUsers);
          break;
        }
      }

    })

    socket.on('connect_error', err => {
      // if (err.message === 'Invalid username') {
        console.log(err.message);
      // }
    })

    socket.on('connect', () => {
      console.log(socket.id)
    })

    socket.on('users', users => {
      console.log(users)
      users.forEach(user => {
        user.self = user.userId === socket.id;
      })

      const newUsers = users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      })
      setUsers(newUsers);
    })

    socket.on('user connected', user => {
      setUsers(prev => ([...prev, user]));
    })

    return () => {
      socket.off('receive_message');
      socket.off('connect_error');
      socket.off('users');
      socket.off('user connected');
    }
  }, [])



  return (
    <div className="app">
      
      {console.log('selectedUser', selectedUser)}
      {console.log(users)}
      {users && (
        users.map((user, idx) => {
          return (
            <p 
              key={idx} 
              onClick={() => setSelectedUser({
                username: user.username, 
                userId: user.userId,
                messages: []
              })}
              className={selectedUser && selectedUser.userId === user.userId ? 'selected' : ''}
            >
              {user.username} <small>{user.userId}</small>
            </p>
          )
        })
      )}
      <hr />
    <input type="text" placeholder="Username..." value={username} onChange={e => setUsername(e.target.value)} />
    <button onClick={selectUsername}>Select Username</button>

      <input type="text" placeholder="Room..." value={room} onChange={e => setRoom(e.target.value)} />
      <button onClick={joinRoom}>Join Room</button>

      <input type="text" placeholder="Message..." value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send Message</button>
      <h1>Message: {messageReceived}</h1>
    </div>
  )
}

export default App