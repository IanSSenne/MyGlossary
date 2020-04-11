import React from "react";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { Wrap } from "../../components/wrap";
import { TopBar } from "../../components/TopBar";
import * as Blueprint from "@blueprintjs/core";
import { Button } from "@blueprintjs/core";
import IsAuthenticated from "../../components/auth/IsAuthenticated";
import LoginContainer from "../../components/auth/LoginContainer";
import { ref } from "../../helpers/fb";
function Page(props) {
    const firebase = useFirebase()
    const auth = useSelector(state => state.firebase.auth)
    return (
        <div>
            <TopBar></TopBar>
            <IsAuthenticated>
                <Blueprint.Card>
                    <h1 className={Blueprint.Classes.HEADING}>Would you like to join {props.target}?</h1>
                    <Blueprint.Divider></Blueprint.Divider>
                    <Button onClick={async () => {
                        debugger;
                        if (!await ref.exists(firebase.ref(`org/${props.target}/user/${auth.uid}`))) {
                            firebase.ref(`org/${props.target}/user/${auth.uid}/accepted`).set(false);
                            window.location.replace("/");
                        } else {
                            window.location.replace("/error?error=" + encodeURI("unable to join as you are already awaiting acceptance or already in this organization."));
                        }
                    }} intent={Blueprint.Intent.SUCCESS}>Yes</Button>
                    <Button onClick={() => { window.location.replace("/") }} intent={Blueprint.Intent.DANGER}>No</Button>
                </Blueprint.Card>
            </IsAuthenticated>
            <IsAuthenticated target="unauthenticated">
                <Blueprint.Card>
                    <h1 className={Blueprint.Classes.HEADING}>please login to join {props.target}</h1>
                    <LoginContainer></LoginContainer>
                </Blueprint.Card>
            </IsAuthenticated>
        </div >
    );
}
const Exposed = (props) => <Wrap><Page {...props}></Page></Wrap>
Exposed.getInitialProps = async (req) => {
    return { target: req.query.id };
}
export default Exposed;