import React, { useState } from "react";
import { Popover, Tabs, Tab, FormGroup, InputGroup, Card } from "@blueprintjs/core";
import { useFirebase } from "react-redux-firebase";
const LoginPanel = () => {
    const firebase = useFirebase();
    const [error, setError] = useState("");
    return (<Card>
        <form onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            const email = data.get("email");
            const password = data.get("password");
            firebase.auth().signInWithEmailAndPassword(email, password).catch(e => {
                setError(e.message);
            })
        }}>
            <FormGroup
                helperText="Please enter your email"
                label="Email"
                labelFor="login-email-input"
                labelInfo="(required)"
            >
                <InputGroup id="login-email-input" name="email" placeholder="Email" autoComplete="email" />
            </FormGroup>

            <FormGroup
                helperText="Please enter your password"
                label="Password"
                labelFor="login-password-input"
                labelInfo="(required)"
            >
                <InputGroup id="login-password-input" placeholder="Password" name="password" type="password" autoComplete="password" />
            </FormGroup>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <InputGroup type="submit" value="Sign In"></InputGroup>
        </form>
    </Card>);
}
const SignUpPanel = () => {
    const firebase = useFirebase();
    const [passwordIsCorrect, setPasswordIsCorrect] = useState("");
    const [emailHint, setEmailHint] = useState("");
    return (<Card>
        <form onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            const email = data.get("email");
            const password = data.get("password");
            const confirmationPassword = data.get("confirmationPassword");
            const correctPass = confirmationPassword === password;
            if (correctPass) {
                firebase.createUser({ email, password }).then(console.log.bind(console, "success")).catch(e => {
                    console.log(e);
                    switch (e.code) {
                        case "auth/email-already-in-use":
                        case "auth/invalid-email":
                            setEmailHint(e.message);
                            // setEmailHint("email already in use");
                            // break;
                            // setEmailHint("invalid email");
                            // break;
                            break;
                        case "auth/weak-password":
                            setPasswordIsCorrect(e.message);
                            break;
                        case "auth/operation-not-allowed":
                        case "auth/timeout":
                            setEmailHint("this line of code should not be possible...");
                            setPasswordIsCorrect("this line of code should not be possible...");
                            break;
                    }
                });
            } else {
                setPasswordIsCorrect("passwords are not the same.")
            }
        }}>
            <FormGroup
                helperText={emailHint}
                label="Email"
                labelFor="signup-email-input"
                labelInfo="(required)"
            >
                <InputGroup id="signup-email-input" placeholder="Email" name="email" autoComplete="email" />
            </FormGroup>

            <FormGroup
                label="Password"
                labelFor="signup-password-input"
                labelInfo="(required)"
            >
                <InputGroup id="signup-password-input" name="password" placeholder="Password" type="password" autoComplete="new-password" />
            </FormGroup>

            <FormGroup
                helperText={passwordIsCorrect}
                label="Confirm Password"
                labelFor="signup-password-confirm-input"
                labelInfo="(required)"
            >
                <InputGroup id="signup-password-confirm-input" placeholder="Password" type="password" name="confirmationPassword" autoComplete="new-password" />
            </FormGroup>
            <InputGroup type="submit" value="Sign Up"></InputGroup>
        </form>
    </Card>);
}
export default (props) => {
    return <Popover>
        {props.children}
        <Card>
            <Tabs>
                <Tab id="login" title="Login" panel={<LoginPanel></LoginPanel>}>
                </Tab>
                <Tab id="signup" title="Sign Up" panel={<SignUpPanel></SignUpPanel>}>
                </Tab>
            </Tabs>
        </Card>
    </Popover>
}