// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
import React from "react";
import { useSelector } from "react-redux";
import Auth from "./Auth";
import Chat from "./Chat";

const App = () => {
  const { user } = useSelector((state) => state.auth);

  return <div>{user ? <Chat /> : <Auth />}</div>;
};




export default App;
