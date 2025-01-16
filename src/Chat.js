// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { db } from "./firebase"; // Ensure Firebase is configured
// import {
//   addDoc,
//   collection,
//   onSnapshot,
//   serverTimestamp,
// } from "firebase/firestore";
// import { setMessages } from "./chatSlice";
// import "./Chat.css";

// const Chat = () => {
//   const { user } = useSelector((state) => state.auth); // Get the logged-in user
//   const { messages } = useSelector((state) => state.chat); // Get messages from Redux
//   const dispatch = useDispatch();
//   const [message, setMessage] = useState("");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [users, setUsers] = useState([]);

//   // Fetch list of registered users
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
//       const fetchedUsers = snapshot.docs
//         .map((doc) => doc.data())
//         .filter((userData) => userData.email !== user?.email); // Exclude logged-in user
//       setUsers(fetchedUsers);
//     });
//     return () => unsubscribe(); // Cleanup listener
//   }, [user?.email]);

//   // Fetch messages in real-time
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
//       const fetchedMessages = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//         timestamp: doc.data().timestamp
//           ? doc.data().timestamp.seconds * 1000
//           : null, // Convert to Unix timestamp (milliseconds)
//       }));
//       dispatch(setMessages(fetchedMessages));
//     });

//     return () => unsubscribe(); // Cleanup listener
//   }, [dispatch]);

//   // Send a new message with Firebase Timestamp
//   const sendMessage = async () => {
//     if (!message.trim()) {
//       alert("Message cannot be empty.");
//       return;
//     }

//     if (!selectedUser) {
//       alert("Please select a user to chat with.");
//       return;
//     }

//     try {
//       if (!user || !user.email || !user.name || !user.photo) {
//         throw new Error("User information is incomplete. Please log in again.");
//       }

//       await addDoc(collection(db, "messages"), {
//         senderEmail: user.email,
//         receiverEmail: selectedUser.email,
//         user: user.name,
//         photo: user.photo,
//         message: message.trim(),
//         timestamp: serverTimestamp(), // Firebase Timestamp
//       });

//       setMessage(""); // Clear the input field
//     } catch (error) {
//       alert("Failed to send the message.");
//       console.error("Error sending message: ", error);
//     }
//   };

//   return (
//     <div className="mainheader">
//       <div className="navbar"><h1 >Real Time Chat App</h1></div>

//       <div className="chat-app">
//         {/* Left Sidebar: List of registered users */}

//         <div className="sidebar">
//           <h3>Users</h3>
//           <ul className="user-list">
//             {users.map((userItem) => (
//               <li
//                 key={userItem.email}
//                 className={`user-item ${
//                   selectedUser?.email === userItem.email ? "active" : ""
//                 }`}
//                 onClick={() => setSelectedUser(userItem)}
//               >
//                 <img
//                   src={userItem.photo || "https://via.placeholder.com/50"}
//                   alt={userItem.name}
//                   className="user-photo"
//                 />
//                 <span>{userItem.name}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Main Chat Area */}
//         <div className="chat-container">
//           {/* User Profile */}
//           {user && (
//             <div className="user-profile">
//               <img src={user.photo} alt={user.name} className="user-photo" />
//               <strong>{user.name}</strong>
//             </div>
//           )}

//           {/* Messages */}
//           <div className="messages-container">
//             {messages
//               .filter(
//                 (msg) =>
//                   (msg.senderEmail === user.email &&
//                     msg.receiverEmail === selectedUser?.email) ||
//                   (msg.senderEmail === selectedUser?.email &&
//                     msg.receiverEmail === user.email)
//               )
//               .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp
//               .map((msg) => (
//                 <div
//                   key={msg.id}
//                   className={`message ${
//                     msg.senderEmail === user.email ? "sent" : "received"
//                   }`}
//                 >
//                   <div className="message-header">
//                     <img
//                       src={msg.photo}
//                       alt={msg.user}
//                       className="message-photo"
//                     />
//                     <div className="message-user-info">
//                       <strong className="message-user">{msg.user}</strong>
//                       <small className="message-timestamp">
//                         {msg.timestamp
//                           ? new Date(msg.timestamp).toLocaleTimeString()
//                           : "Time not available"}
//                       </small>
//                     </div>
//                   </div>
//                   <p className="message-text">{msg.message}</p>
//                 </div>
//               ))}
//           </div>

//           {/* Input Area */}
//           <div className="input-container">
//             <textarea
//               className="message-input"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message"
//             />
//             <button
//               className="send-btn"
//               onClick={sendMessage}
//               disabled={!selectedUser || !message.trim()}
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { db } from "./firebase"; // Ensure Firebase is configured
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
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
  const [unreadCounts, setUnreadCounts] = useState({});

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

  // Fetch messages in real-time and calculate unread counts
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

      // Calculate unread counts
      const counts = {};
      fetchedMessages.forEach((msg) => {
        if (
          msg.receiverEmail === user.email &&
          !msg.isRead &&
          msg.senderEmail
        ) {
          counts[msg.senderEmail] = (counts[msg.senderEmail] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [dispatch, user.email]);

  // Mark messages as read
  const markMessagesAsRead = async (userEmail) => {
    const userMessages = messages.filter(
      (msg) =>
        msg.senderEmail === userEmail &&
        msg.receiverEmail === user.email &&
        !msg.isRead
    );

    userMessages.forEach(async (msg) => {
      const messageRef = doc(db, "messages", msg.id);
      await updateDoc(messageRef, { isRead: true });
    });
  };

  // Select a user to chat with
  const handleUserSelection = (userItem) => {
    setSelectedUser(userItem);
    markMessagesAsRead(userItem.email); // Mark messages as read
  };

  // Send a new message
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
      await addDoc(collection(db, "messages"), {
        senderEmail: user.email,
        receiverEmail: selectedUser.email,
        user: user.name,
        photo: user.photo,
        message: message.trim(),
        timestamp: serverTimestamp(),
        isRead: false, // New message is unread by default
      });

      setMessage(""); // Clear the input field
    } catch (error) {
      alert("Failed to send the message.");
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="mainheader">
      <div className="navbar"><h1>Real Time Chat App</h1></div>

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
                onClick={() => handleUserSelection(userItem)}
              >
                <img
                  src={userItem.photo || "https://via.placeholder.com/50"}
                  alt={userItem.name}
                  className="user-photo"
                />
                <span>{userItem.name}</span>
                {unreadCounts[userItem.email] > 0 && (
                  <span className="unread-count">
                    {unreadCounts[userItem.email]}
                  </span>
                )}
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
