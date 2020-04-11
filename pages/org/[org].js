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
            <TopBar></TopBar>
            <IsAuthenticated target="unauthenticated">
                <Redirect target="/"></Redirect>
            </IsAuthenticated>
            <IsAuthenticated>
                {!Boolean(words) ? "loading..." : <div className="words-wrapper">{words.map(_ => <Word word={_}></Word>)}</div>}
                <Card className="word-container" interactive onClick={() => {
                    setAddWordVisible(true);
                }}>
                    <div style={{ width: "33%", margin: "auto", textAlign: "center", color: "gray" }}>
                        <Icon icon="add" iconSize={64} color="gray"></Icon>
                        <br />
                        <h1>Add a word.</h1>
                    </div>
                </Card>
                {addWordVisible && <Dialog
                    className={this.props.data.themeName}
                    icon="info-sign"
                    onClose={this.handleClose}
                    title="Palantir Foundry"
                    {...this.state}
                >

                </Dialog>}
            </IsAuthenticated>
        </div>
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { org: req.query.org };
}
export default Exported;