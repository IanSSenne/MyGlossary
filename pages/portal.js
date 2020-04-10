import React from "react";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { Wrap } from "../components/wrap";
import Redirect from "../components/redirect";
import IsAuthenticated from "../components/auth/IsAuthenticated";
import { TopBar } from "../components/TopBar";
function Page({ children }) {
  const firebase = useFirebase()
  const auth = useSelector(state => state.firebase.auth)
  return (
    <div>
      <TopBar></TopBar>
    </div >
  );
}
export default () => <Wrap><Page></Page></Wrap>
