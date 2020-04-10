import React, { useState } from "react";
import { useFirebase } from "react-redux-firebase";
import { useSelector, useStore } from "react-redux";
import { Wrap } from "../components/wrap";
import IsAuthenticated from "../components/auth/IsAuthenticated";
import { TopBar } from "../components/TopBar";
import { InputGroup, Card, Classes, Intent, Button } from "@blueprintjs/core";
import { ref } from "../helpers/fb";


function Page({ children }) {
  const firebase = useFirebase()
  const auth = useSelector(state => state.firebase.auth)
  const [orgName, setOrgName] = useState("");
  const [orgValidatorIntent, setOrgValidatorIntent] = useState(Intent.NONE);
  const [orgValidatorLength, setOrgValidatorLength] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <TopBar></TopBar>
      <IsAuthenticated target="unauthenticated">

        <Card style={{ maxWidth: "500px" }}>
          <h1 className={Classes.HEADING}>Create Organization</h1>
          <InputGroup value={orgName} placeholder="Organization name" disabled></InputGroup>
          <p>please log in to make an organization</p>
          <Button rightIcon="arrow-right" intent="success" text="Next step" disabled />
        </Card>
      </IsAuthenticated>
      <IsAuthenticated>
        <Card style={{ maxWidth: "500px" }}>
          <h1 className={Classes.HEADING}>Create Organization</h1>
          <InputGroup
            value={orgName}
            onChange={(evt) => {
              setError("");
              setOrgName(evt.target.value);
              if (evt.target.value.match(/[^a-zA-Z0-9]/)) {
                if (Intent.DANGER === orgValidatorIntent) {
                  setError(`invalid character "${JSON.stringify(evt.target.value.match(/[^a-zA-Z0-9]/))}".`);
                }
                setOrgValidatorIntent(orgValidatorIntent);
              } else {
                setOrgValidatorIntent(Intent.NONE);
              }
              if (evt.target.value.length <= 6) {
                setError("organization name must be atleast 7 characters of length.");
              } else {
              }
              setOrgValidatorLength(evt.target.value.length > 6);
            }}
            placeholder="Organization name"
            intent={orgValidatorIntent}
          ></InputGroup>
          <p>{error}</p>
          <Button rightIcon="arrow-right" intent="success" text="Next step" onClick={async () => {
            if (Intent.DANGER === orgValidatorIntent || !orgValidatorLength) {
              return;
            } else {
              if (await ref.exists(firebase.ref("org").child(orgName))) {
                setError(`Organization "${orgName}" already exists.`);
              } else {
                setError("");
                firebase.ref("org").child(orgName).set({ owner: auth.uid });
                firebase.ref("users").child(auth.uid).child("ownedOrganizations").push({ name: orgName });
                window.location.replace("/org/" + orgName + "/initialize");
              }
            }
          }} disabled={Intent.DANGER === orgValidatorIntent || !orgValidatorLength} />
        </Card>
      </IsAuthenticated>
    </div >
  );
}
export default () => <Wrap><Page></Page></Wrap>
