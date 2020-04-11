import React, { useEffect, useState } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../../components/wrap";
import IsAuthenticated from "../../../components/auth/IsAuthenticated";
import { TopBar } from "../../../components/TopBar";
import { Card, Classes, Icon, Dialog, Tooltip, Button, InputGroup } from "@blueprintjs/core";
import { ref } from "../../../helpers/fb";
import Redirect from "../../../components/redirect";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
function Word(props) {
    return <Card className="word-container" interactive style={{ height: "200px", minWidth: "200px", display: "table-cell", position: "relative", margin: "5px" }}>
        <div style={{ textAlign: "center", color: "gray", position: "absolute", top: "50%", transform: "translateY(-50%)" }}>
            <h3>{props.word}</h3>
            <p>{props.description}</p>
        </div>
    </Card>;
}

function Page({ children, org }) {
    const firebase = useFirebase();
    const [words, setWords] = useState();
    const [addWordVisible, setAddWordVisible] = useState(false);
    const [newWord, setNewWord] = useState("");
    const auth = useSelector(state => state.firebase.auth);
    if (!Boolean(words)) {
        const orgRef = firebase.ref(`/org/${org}`);
        orgRef.child("words").orderByKey().on("value", (snap) => {
            const val = snap.val();
            setWords(val ? Object.entries(val) : []);
        })
    }
    return (
        <div>
            <TopBar org={org}></TopBar>
            <IsAuthenticated target="unauthenticated">
                <Redirect target="/"></Redirect>
            </IsAuthenticated>
            <IsAuthenticated>
                {!Boolean(words) ? "loading..." : <div style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                    paddingTop: 8
                }}>
                    {words.map(_ => <Word key={_[0]} word={_[1].word}></Word>)}
                    <Card className="word-container" interactive onClick={() => {
                        setAddWordVisible(true);
                    }} style={{ height: "200px", minWidth: "200px", display: "table-cell", position: "relative", margin: "5px" }}>
                        <div style={{ textAlign: "center", color: "gray", position: "absolute", top: "50%", transform: "translateY(-50%)" }}>
                            <Icon icon="add" iconSize={64} color="gray"></Icon>
                            <br />
                            <h1>Add a word.</h1>
                        </div>
                    </Card>
                </div>}

                {addWordVisible && <Dialog

                    autoFocus={true}
                    canEscapeKeyClose={true}
                    canOutsideClickClose={true}
                    enforceFocus={true}

                    isOpen={true}
                    icon="info-sign"
                    onClose={() => {
                        setAddWordVisible(false);
                        setNewWord("");
                    }}
                    title="Add a word."
                >
                    <div className={Classes.DIALOG_BODY}>
                        <p>Please enter the word to add</p>
                        <InputGroup onChange={(evt) => setNewWord(evt.target.value)} value={newWord}></InputGroup>
                    </div>
                    <div className={Classes.DIALOG_FOOTER}>
                        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                            <Button onClick={() => {
                                firebase.ref(`org/${org}/words`).push({ word: newWord });
                                setNewWord("");
                                setAddWordVisible(false);
                            }}>Add</Button>

                        </div>
                    </div>
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