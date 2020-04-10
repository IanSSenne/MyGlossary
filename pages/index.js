import React from "react";
// import { Provider } from "react-redux";
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { Wrap } from "../components/wrap";
import Redirect from "../components/redirect";
import IsAuthenticated from "../components/auth/IsAuthenticated";
// import LoginContainer from "../components/auth/LoginContainer";
// import IsAuthenticated from "../components/auth/IsAuthenticated";

function Page({ children }) {
  const firebase = useFirebase()
  const auth = useSelector(state => state.firebase.auth)
  return (
    <div>
      <Redirect target="/home" instant={true}></Redirect>
    </div >
  );
}
export default () => <Wrap><Page></Page></Wrap>
