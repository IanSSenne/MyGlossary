import React, { useEffect, useState } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../components/wrap";
import IsAuthenticated from "../../components/auth/IsAuthenticated";
import { TopBar } from "../../components/TopBar";
import { Card, Classes, Icon } from "@blueprintjs/core";
import { ref } from "../../helpers/fb";
import Redirect from "../../components/redirect";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";


function Page({ children, org }) {
    const firebase = useFirebase();
    const [words, setWords] = useState();
    const [addWordVisible, setAddWordVisible] = useState(false);
    const auth = useSelector(state => state.firebase.auth);
    if (!Boolean(words)) {
        const orgRef = firebase.ref(`/org/${org}`);
        orgRef.child("words").orderByKey().on("value", (snap) => {
            setWords(snap.val() || []);
        })
    }
    return (
        <div>
            <TopBar org={org}></TopBar>
        </div>
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { org: req.query.org };
}
export default Exported;