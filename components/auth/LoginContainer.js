import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase"
import React, { useState } from "react";
import IsAuthenticated from "./IsAuthenticated";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { Card, InputGroup } from "@blueprintjs/core";
export default function LoginContainer() {
    const firebase = useFirebase();
    const auth = firebase.auth();
    const [email, setEmail] = useState("");
    const logout = () => {
        firebase.logout();
    };
    return <>
        <IsAuthenticated target="unauthenticated">
            <StyledFirebaseAuth
                uiConfig={{
                    signInFlow: 'popup',
                    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
                    callbacks: {
                        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                            firebase.handleRedirectResult(authResult).then(() => {
                                window.location.replace("/");
                            });
                            return false;
                        },
                    },
                }}
                firebaseAuth={auth}
            />
            <Card>

                <InputGroup
                    leftIcon="envelope"
                    onChange={(evt) => setEmail(evt.target.value)}
                    placeholder="Enter your email..."
                    value={email}
                />
                <InputGroup
                    placeholder="Enter your password..."
                    leftIcon="lock"
                    type="password"
                />
            </Card>

        </IsAuthenticated>
        <IsAuthenticated>
            <button onClick={logout}>Logout</button>
        </IsAuthenticated>
    </>
}