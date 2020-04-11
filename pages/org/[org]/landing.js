import React, { useEffect } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../../components/wrap";
import IsAuthenticated from "../../../components/auth/IsAuthenticated";
import { TopBar } from "../../../components/TopBar";
import { Card, Classes } from "@blueprintjs/core";
import { ref } from "../../../helpers/fb";
import Redirect from "../../../components/redirect";
import { useFirebase } from "react-redux-firebase";


function Page({ children, org }) {
    const firebase = useFirebase();
    useEffect(() => {
        async function exec() {
            if (!(await ref.exists(firebase.ref("org/" + org)))) {
                window.location.replace(`/error?error=${encodeURI(`organization "${org}" does not exist and therefore can not be initialized.`)}`);
            } else {
                firebase.ref("org/" + org).orderByKey().once("value", (snapshot) => {
                    if (!Boolean(temp1.val().isInitialized)) {
                        window.location.replace(`/error?error=${encodeURI(`organization "${org}" has already been initialized and therefore can not be initialized.`)}`);
                    }
                });
            }
        }
        exec();
    })
    // const auth = useSelector(state => state.firebase.auth)
    // const [orgName, setOrgName] = useState("");
    // const [orgValidatorIntent, setOrgValidatorIntent] = useState(Intent.NONE);
    // const [orgValidatorLength, setOrgValidatorLength] = useState(false);
    // const [error, setError] = useState("");
    return (
        <div>
            <TopBar></TopBar>
            <IsAuthenticated target="unauthenticated">
                <Redirect target="/"></Redirect>
            </IsAuthenticated>
            <IsAuthenticated>
                <Redirect target={`/org/${org}/view`}></Redirect>
            </IsAuthenticated>
        </div>
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { org: req.query.org };
}
export default Exported;