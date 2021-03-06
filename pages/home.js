import React, { useState } from "react";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { Wrap } from "../components/wrap";
import IsAuthenticated from "../components/auth/IsAuthenticated";
import { TopBar } from "../components/TopBar";
import { InputGroup, Card, Classes, Intent, Button } from "@blueprintjs/core";
import { ref } from "../helpers/fb";
import { useRouter } from "next/router";
import SCOPES from "../helpers/scopes";

function Page({ children }) {
  const firebase = useFirebase()
  const auth = useSelector(state => state.firebase.auth)
  const [orgName, setOrgName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [orgValidatorIntent, setOrgValidatorIntent] = useState(Intent.NONE);
  const [orgValidatorLength, setOrgValidatorLength] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
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
                firebase.ref("org").child(orgName).set({
                  groups: {
                    default: [
                      SCOPES.WORD_EDIT_WORD,
                      SCOPES.WORD_REMOVE_WORD,
                      SCOPES.WORD_APROVE_WORD,
                      SCOPES.WORD_SET_DEFINITION,
                      SCOPES.WORD_CREATE
                    ]
                  },
                  owner: auth.uid, users: {
                    [auth.uid]: {
                      scopes: [
                        SCOPES.WORD_EDIT_WORD,
                        SCOPES.WORD_REMOVE_WORD,
                        SCOPES.WORD_APROVE_WORD,
                        SCOPES.WORD_SET_DEFINITION,
                        SCOPES.WORD_CREATE,
                        SCOPES.ORG_OWNER,
                        SCOPES.ORG_ADMIN_MANAGE_USERS,
                        SCOPES.ORG_ADMIN_UPLOAD_WORDS,
                        SCOPES.ORG_ADMIN_REMOVE_USERS],
                      accepted: true
                    }
                  }
                });
                firebase.ref("users").child(auth.uid).child("owned").push({ name: orgName });
                firebase.ref("users").child(auth.uid).child("joined").push({ name: orgName });
                router.push("/org/" + orgName + "/landing");
              }
            }
          }} disabled={Intent.DANGER === orgValidatorIntent || !orgValidatorLength} />
        </Card>
      </IsAuthenticated>
      <IsAuthenticated target="unauthenticated">
        <Card style={{ maxWidth: "500px" }}>
          <h1 className={Classes.HEADING}>Join Organization</h1>
          <InputGroup value={joinName} placeholder="Organization name" disabled></InputGroup>
          <p>please log in to join an organization</p>
          <Button rightIcon="arrow-right" intent="success" text="Next step" disabled />
        </Card>
      </IsAuthenticated>
      <IsAuthenticated>
        <Card style={{ maxWidth: "500px" }}>
          <h1 className={Classes.HEADING}>Join Organization</h1>
          <InputGroup
            value={joinName}
            onChange={(evt) => {
              setJoinName(evt.target.value);
            }}
            placeholder="Organization name"
          ></InputGroup>
          <Button rightIcon="arrow-right" intent="success" text="Next step" onClick={() => {
            router.push('/join/[id]', `/join/${joinName}`);
          }} />
        </Card>
      </IsAuthenticated>
    </div >
  );
}

export default () => <Wrap><Page></Page></Wrap>
