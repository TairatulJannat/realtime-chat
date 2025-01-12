import React from "react";
import { useSelector } from "react-redux";
import Auth from "./Auth";
import Chat from "./Chat";

const App = () => {
  const { user } = useSelector((state) => state.auth);

  return <div>{user ? <Chat /> : <Auth />}</div>;
};




export default App;
