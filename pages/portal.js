import React, { useState } from "react";
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { Wrap } from "../components/wrap";
import { TopBar } from "../components/TopBar";
import Link from "next/link";
import { Card, Elevation } from "@blueprintjs/core";

function Org({ org }) {
  return <Link href="/org/[org]/landing" as={`/org/${org.name}/landing`}>
    <a style={{ textDecoration: "none", color: "black" }}>
      <Card interactive={true} elevation={Elevation.TWO} style={{ margin: "1em" }}>
        <h2>{org.name}</h2>
      </Card>
    </a>
  </Link>
}
function OrgInfo() {
  return <div>
    <h2 style={{ textAlign: "center" }}>
      you are not a member of any organizations
    </h2>
  </div>
}
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
          result.push(<Org key={entry.name} org={entry}></Org>)
        }
        // result.push();
        setOrgs(result);
      } else {
        setOrgs([]);
      }
    })
  }
  return (
    <div>
      <TopBar></TopBar>
      {isLoaded(orgs) ? (isEmpty(orgs) ? <OrgInfo></OrgInfo> : orgs) : <div>
        <h2 style={{ textAlign: "center" }}>Loading...</h2>
      </div>}
    </div>
  );
}
export default () => <Wrap><Page></Page></Wrap>
