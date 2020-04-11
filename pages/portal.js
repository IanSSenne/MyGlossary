import React, { useState } from "react";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { Wrap } from "../components/wrap";
import Redirect from "../components/redirect";
import IsAuthenticated from "../components/auth/IsAuthenticated";
import { TopBar } from "../components/TopBar";
function Page({ children, isServer }) {
  const firebase = useFirebase()
  const auth = useSelector(state => state.firebase.auth)
  const [orgs, setOrgs] = useState();
  if (!orgs) {
    firebase.ref(`/users/${auth.uid}/joined`).on("value", (snap) => {
      const val = snap.val();
      if (val) {
        let result = [];
        let entries = Object.values(val);
        for (const entry of entries) {
          result.push(<li key={entry.name}><a href={"/org/" + entry.name + "/landing"}>{entry.name}</a></li>)
        }
        // result.push();
        setOrgs(result);
      }
    })
  }
  return (
    <div>
      <TopBar></TopBar>
      {!Boolean(orgs) ? "loading..." : <ul>{orgs}</ul>}
    </div >
  );
}
export default () => <Wrap><Page></Page></Wrap>
