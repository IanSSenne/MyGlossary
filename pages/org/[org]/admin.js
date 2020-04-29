import React, { useEffect, useState } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../../components/wrap";
import IsAuthenticated from "../../../components/auth/IsAuthenticated";
import { TopBar } from "../../../components/TopBar";
import { Classes, Tree, Intent, Button, Dialog, FileInput } from "@blueprintjs/core";
import Redirect from "../../../components/redirect";
import { useFirebase } from "react-redux-firebase";
import papa from "papaparse";
function AdminUserInterface(props) {
    const [uid, name, meta] = props.user;
    const { org } = props;
    const firebase = useFirebase();
    const [userUIVisible, setUserUIVisible] = useState(false);
    return <>
        <Button className={Classes.MINIMAL} icon="user" text={name} onClick={() => {
            setUserUIVisible(true)
        }}></Button>
        <Dialog

            autoFocus={true}
            canEscapeKeyClose={true}
            canOutsideClickClose={true}
            enforceFocus={true}

            isOpen={userUIVisible}
            icon="user"
            onClose={() => {
                setUserUIVisible(false);
            }}
            title={`Manage "${name}"`}
        >
            <div className={Classes.DIALOG_BODY}>
                {!meta.accepted && (<>
                    <Button icon="plus" intent={Intent.SUCCESS} text={"accept user"} onClick={() => {
                        firebase.ref(`org/${org}/user/${uid}/accepted`).set(true);
                        firebase.ref(`users/${uid}/joined`).push({ name: org });
                        setUserUIVisible(false);
                    }}></Button>
                    <Button icon="plus" intent={Intent.DANGER} text={"decline user"} onClick={() => {
                        firebase.ref(`org/${org}/user/${uid}`).remove();
                        setUserUIVisible(false);
                    }}></Button>
                </>)}

                {meta.accepted && (<Button intent={Intent.DANGER} onClick={() => {
                    firebase.ref(`org/${org}/user/${uid}/accepted`).set(true);
                }}></Button>)}
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button onClick={() => {
                        setUserUIVisible(false);
                    }}>Close</Button>

                </div>
            </div>
        </Dialog>
    </>
}

function Page({ children, org }) {
    const firebase = useFirebase();
    let id = 0;
    const state = {
        renderId: 0, nodes: [
            {
                id: id++,
                icon: "folder-close",
                isExpanded: false,
                label: "verified users",
                childNodes: [

                ],
            },
            {
                id: id++,
                icon: "folder-close",
                isExpanded: false,
                label: "unverified users",
                childNodes: [

                ],
            },
        ]
    };
    const [usableState, setUsableState] = useState(state);
    const [fileUpload, setFileUpload] = useState("");
    const [files, setFiles] = useState();
    const [errors, setErrors] = useState([]);
    useEffect(() => {
        firebase.ref(`org/${org}/user`).orderByValue().on("value", async (snapshot) => {
            const users = snapshot.val();
            if (!users) {
                return;
            }
            const val = Object.entries(users);
            const verified = [];
            const unverified = [];
            console.log("val", val);
            const p = [];
            for (let i = 0; i < val.length; i++) {
                p.push(new Promise((resolve) => {
                    firebase.ref(`users/${val[i][0]}/displayName`).on("value", (snapshot) => {
                        resolve(snapshot.val());
                    })
                }).then((data) => {
                    if (val[i][1].accepted) {
                        verified.push([val[i][0], data, users[val[i][0]]]);
                    } else {
                        unverified.push([val[i][0], data, users[val[i][0]]]);
                    }
                }));
            }
            await Promise.all(p);
            verified.forEach(user => {
                state.nodes[0].childNodes.push({
                    id: id++,
                    label: (<AdminUserInterface user={user} org={org}></AdminUserInterface>),
                });
            });
            unverified.forEach(user => {
                state.nodes[1].childNodes.push({
                    id: id++,
                    label: (<AdminUserInterface user={user} org={org}></AdminUserInterface>)
                });
            });
        });
    }, []);
    return (
        <div>
            <IsAuthenticated target="unauthenticated">
                <Redirect target="/"></Redirect>
            </IsAuthenticated>
            <IsAuthenticated>
                <TopBar org={org}></TopBar>
                <table>
                    <tbody>
                        <tr>
                            <th>
                                <Tree
                                    onNodeClick={(node, _nodepath, e) => { }}
                                    onNodeCollapse={(node) => {
                                        node.isExpanded = false;
                                        setUsableState({ nodes: usableState.nodes, renderId: state.renderId + 1 });
                                    }}
                                    onNodeExpand={(node) => {
                                        node.isExpanded = true;
                                        setUsableState({ nodes: usableState.nodes, renderId: state.renderId + 1 });
                                    }}
                                    contents={usableState.nodes}>
                                </Tree>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <div style={{ display: "flex", verticalAlign: "center" }}>
                                    <FileInput text={fileUpload.length ? fileUpload : "Choose file..."} onInputChange={(evt) => {
                                        console.log(evt.target.files);
                                        setFiles(evt.target.files);
                                        setFileUpload(evt.target.files[0].name);
                                    }}
                                        inputProps={{ accept: ".csv" }}
                                        hasSelection={fileUpload.length > 0} />
                                    <Button icon="import" disabled={!fileUpload.length} intent={Intent.SUCCESS} text="import" onClick={async () => {
                                        const url = URL.createObjectURL(files[0]);

                                        const csvString = await fetch(url).then(content => content.text());
                                        const result = papa.parse(csvString);
                                        if (result.errors.length) {
                                            setErrors(result.errors.map(_ => _.message));
                                            return;
                                        } else {
                                            URL.revokeObjectURL(url);//we has the meats(*data) so lets revoke the url. be nice to the browser and clean up after ourselves
                                            const ores = Array.from(Array(result.data.length - 1), () => ({ meta: {} }));

                                            const internal = ["type", "definition", "word"];
                                            for (let i = 0; i < result.data[0].length; i++) {
                                                const key = result.data[0][i].toLowerCase();
                                                if (key != "") {
                                                    for (let j = 1; j < result.data.length; j++) {
                                                        if (internal.includes(key)) {
                                                            ores[j - 1][key] = result.data[j][i];
                                                        } else {
                                                            ores[j - 1].meta[key] = result.data[j][i];
                                                        }
                                                    }
                                                }
                                            }
                                            const errors = [];
                                            debugger;
                                            for (let i = 0; i < ores.length; i++) {
                                                const current = ores[i];
                                                if (current.type && current.definition && current.word) {
                                                    current.type = current.type.toLowerCase();
                                                    if ("term" !== current.type && "acronym" !== current.type) {
                                                        errors.push([`invalid word type '${current.type}'`]);
                                                    }
                                                } else {
                                                    errors.push(`term is missing required perameter {type='${current.type}',definition='${current.definition}',word='${current.word}'`);
                                                }
                                            }
                                            if (errors.length) {
                                                setErrors(errors);
                                                return;
                                            }
                                            ores.forEach(uploadedWord => {
                                                const word = {
                                                    word: uploadedWord.word,
                                                    definition: uploadedWord.definition,
                                                    tags: [
                                                        {
                                                            isRemovable: false,
                                                            isSystemTag: true,
                                                            tag: uploadedWord.type
                                                        }
                                                    ],
                                                    meta: uploadedWord.meta
                                                };
                                                firebase.ref(`/org/${org}/words`).push(word);
                                            });
                                        }

                                    }}></Button>
                                    <hr />
                                    <ol>
                                        {errors.map((v, i) => <li key={i}>{v}</li>)}
                                    </ol>
                                </div>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </IsAuthenticated>
        </div>
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { org: req.query.org };
}
export default Exported;