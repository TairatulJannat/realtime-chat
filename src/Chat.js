// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { db } from "./firebase";
// import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
// import { setMessages } from "./chatSlice";
// import './Chat.css';

// const Chat = () => {
//   const { user } = useSelector((state) => state.auth); // Get user from Redux state
//   console.log(user)
//   const { messages } = useSelector((state) => state.chat);
//   const dispatch = useDispatch();
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
//       const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       dispatch(setMessages(fetchedMessages));
//     });
//     return () => unsubscribe();
//   }, [dispatch]);

//   const sendMessage = async () => {
//     if (message.trim()) {
//       await addDoc(collection(db, "messages"), {
//         user: user.name,
//         photo: user.photo,
//         message,
//         timestamp: new Date(),
//       });
//       setMessage("");
//     }
//   };

//   return (
//     <div className="chat-container">
//       {/* Display User's Profile */}
//       {user && (
//         <div className="user-profile">
//           <img src={user.photo} alt={user.name} className="user-photo" />
//           <strong>{user.name}</strong>
//         </div>
//       )}

// <div className="messages-container">
//   {messages.map((msg) => (
//     <div className="message" key={msg.id}>
//       <div className="message-header">
//         <img src={msg.photo} alt={msg.user} className="message-photo" />
//         <div className="message-user-info">
//           <strong className="message-user">{msg.user}</strong>
//           <small className="message-timestamp">
//             {msg.timestamp
//                 ? new Date(msg.timestamp.toDate()).toLocaleTimeString()
//                 : "Time not available"}
//             </small>
//         </div>
//       </div>
//       <p className="message-text">{msg.message}</p>
//     </div>
//   ))}
// </div>

//       <div className="input-container">
//         <textarea
//           className="message-input"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type a message"
//         />
//         <button className="send-btn" onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// };
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { db } from "./firebase"; // Ensure Firebase is configured
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { setMessages } from "./chatSlice";
import "./Chat.css";

const Chat = () => {
  const { user } = useSelector((state) => state.auth); // Get the logged-in user
  const { messages } = useSelector((state) => state.chat); // Get messages from Redux
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Fetch list of registered users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetchedUsers = snapshot.docs
        .map((doc) => doc.data())
        .filter((userData) => userData.email !== user?.email); // Exclude logged-in user
      setUsers(fetchedUsers);
    });
    return () => unsubscribe(); // Cleanup listener
  }, [user?.email]);

  // Fetch messages in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
          ? doc.data().timestamp.seconds * 1000
          : null, // Convert to Unix timestamp (milliseconds)
      }));
      dispatch(setMessages(fetchedMessages));
    });

    return () => unsubscribe(); // Cleanup listener
  }, [dispatch]);

  // Send a new message with Firebase Timestamp
  const sendMessage = async () => {
    if (!message.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    if (!selectedUser) {
      alert("Please select a user to chat with.");
      return;
    }

    try {
      if (!user || !user.email || !user.name || !user.photo) {
        throw new Error("User information is incomplete. Please log in again.");
      }

      await addDoc(collection(db, "messages"), {
        senderEmail: user.email,
        receiverEmail: selectedUser.email,
        user: user.name,
        photo: user.photo,
        message: message.trim(),
        timestamp: serverTimestamp(), // Firebase Timestamp
      });

      setMessage(""); // Clear the input field
    } catch (error) {
      alert("Failed to send the message.");
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="mainheader">
      <div className="navbar"><h1 >Real Time Chat App</h1></div>

      <div className="chat-app">
        {/* Left Sidebar: List of registered users */}

        <div className="sidebar">
          <h3>Users</h3>
          <ul className="user-list">
            {users.map((userItem) => (
              <li
                key={userItem.email}
                className={`user-item ${
                  selectedUser?.email === userItem.email ? "active" : ""
                }`}
                onClick={() => setSelectedUser(userItem)}
              >
                <img
                  src={userItem.photo || "https://via.placeholder.com/50"}
                  alt={userItem.name}
                  className="user-photo"
                />
                <span>{userItem.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Chat Area */}
        <div className="chat-container">
          {/* User Profile */}
          {user && (
            <div className="user-profile">
              <img src={user.photo} alt={user.name} className="user-photo" />
              <strong>{user.name}</strong>
            </div>
          )}

          {/* Messages */}
          <div className="messages-container">
            {messages
              .filter(
                (msg) =>
                  (msg.senderEmail === user.email &&
                    msg.receiverEmail === selectedUser?.email) ||
                  (msg.senderEmail === selectedUser?.email &&
                    msg.receiverEmail === user.email)
              )
              .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${
                    msg.senderEmail === user.email ? "sent" : "received"
                  }`}
                >
                  <div className="message-header">
                    <img
                      src={msg.photo}
                      alt={msg.user}
                      className="message-photo"
                    />
                    <div className="message-user-info">
                      <strong className="message-user">{msg.user}</strong>
                      <small className="message-timestamp">
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString()
                          : "Time not available"}
                      </small>
                    </div>
                  </div>
                  <p className="message-text">{msg.message}</p>
                </div>
              ))}
          </div>

          {/* Input Area */}
          <div className="input-container">
            <textarea
              className="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!selectedUser || !message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;