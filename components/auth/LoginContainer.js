import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase"
import React, { useState } from "react";
import IsAuthenticated from "./IsAuthenticated";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

export default function LoginContainer() {
    const firebase = useFirebase();
    const auth = firebase.auth();
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
        </IsAuthenticated>
        <IsAuthenticated>
            <button onClick={logout}>Logout</button>
        </IsAuthenticated>
    </>
}