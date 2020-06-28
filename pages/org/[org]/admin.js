import React, { useEffect, useState } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../../components/wrap";
import IsAuthenticated from "../../../components/auth/IsAuthenticated";
import { TopBar } from "../../../components/TopBar";
import { Classes, Tree, Intent, Button, Dialog, FileInput, Tabs, Tab, Card } from "@blueprintjs/core";
import { useFirebase } from "react-redux-firebase";
import papa from "papaparse";
import HasPerm from "../../../components/HasPerm";
import SCOPES from "../../../helpers/scopes";
import { useSelector } from "react-redux";
function AdminUserInterface(props) {
    const [uid, name, meta] = props.user;
    const { org, verified } = props;
    const [perms, setPerms] = useState([]);
    const firebase = useFirebase();
    const [userUIVisible, setUserUIVisible] = useState(false);
    useEffect(() => {
        firebase.ref(`/org/${org}/users/${uid}/scopes`).on("value", (snapshot) => {
            setPerms(snapshot.val() || []);
        });
    }, []);
    useEffect(() => {
        if (perms.length !== 0) {
            firebase.ref(`org/${org}/users/${uid}/scopes`).set(perms);
        }
    }, [perms]);
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
                        firebase.ref(`org/${org}/users/${uid}/accepted`).set(true);
                        firebase.ref(`org/${org}/groups/default`).on("value", (snapshot) => {
                            firebase.ref(`org/${org}/users/${uid}/scopes`).set(snapshot.val());
                        })

                        firebase.ref(`users/${uid}/joined`).push({ name: org });
                        setUserUIVisible(false);
                    }}></Button>

                    <Button icon="plus" intent={Intent.DANGER} text={"decline user"} onClick={() => {
                        firebase.ref(`org/${org}/users/${uid}`).remove();
                        setUserUIVisible(false);
                    }}></Button>
                </>)}

                {meta.accepted && (<>
                    {Object.values(SCOPES).map((name) => {
                        return <div key={name}>{name}<input type="checkbox" checked={perms.includes(name)} onChange={(e) => {
                            const checked = e.target.checked;
                            console.log(checked);
                            if (checked) {
                                setPerms([...perms, name]);
                            } else {
                                setPerms(perms.filter(perm => perm != name));
                            }
                        }}></input></div>
                    })}
                </>)}
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button onClick={() => {
                        setUserUIVisible(false);
                    }}>Close</Button>

                </div>
            </div>
        </Dialog>
        <br />
    </>
}

function ManageUsers({ org }) {
    const [verifiedUsers, setVerifiedUsers] = useState([]);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const firebase = useFirebase();
    useEffect(() => {
        firebase.ref(`org/${org}/users`).on("value", async (snapshot) => {
            const users = snapshot.val();
            console.log(users);
            if (!users) {
                return;
            }
            const val = Object.entries(users);
            const verified = [];
            const unverified = [];
            const p = [];
            for (let i = 0; i < val.length; i++) {
                p.push(new Promise((resolve) => {
                    firebase.ref(`users/${val[i][0]}/email`).on("value", (snapshot) => {
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
            console.log(verified, unverified);
            setVerifiedUsers(<Card>
                {verified.map((user, index) => (<AdminUserInterface key={index} user={user} org={org} verified={true}></AdminUserInterface>))}
            </Card>);
            setUnverifiedUsers(<Card>{
                unverified.map((user, index) => (<AdminUserInterface key={index} user={user} org={org} verified={false}></AdminUserInterface>))
            }</Card>);
        });
    }, []);
    return <div>
        <HasPerm perm={SCOPES.ORG_ADMIN_MANAGE_USERS} org={org}>
            <h1 className={Classes.HEADING}>Manage Users</h1>
            <h3>unverified</h3>
            {unverifiedUsers}
            <h3>verified</h3>
            {verifiedUsers}
        </HasPerm>
        <h1>test</h1>
    </div>
}
function UploadWords({ org }) {
    const [fileUpload, setFileUpload] = useState("");
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState([]);
    const firebase = useFirebase();
    const auth = useSelector((state) => state.firebase.auth);
    // return <HasPerm perm={SCOPES.ORG_ADMIN_UPLOAD_WORDS} org={org}>
    return <div style={{ display: "flex", verticalAlign: "center" }}>
        <FileInput text={fileUpload.length ? fileUpload : "Choose file..."} onInputChange={(evt) => {
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

                const internal = ["type", "definition", "word", "tags", "isVerified"];
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
                        definition: uploadedWord.definition.replace(/[\ufff0-\uffff]/g, ""),
                        isVerified: uploadedWord.isVerified || false,
                        history: [
                            {
                                author: auth.uid,
                                definition: uploadedWord.definition.replace(/[\ufff0-\uffff]/g, ""),
                                isVerified: uploadedWord.isVerified || false,
                                tags: [
                                    {
                                        isRemovable: false,
                                        isSystemTag: true,
                                        tag: uploadedWord.type
                                    },
                                    ...(uploadedWord?.tags?.split(",") || []).map(_ => ({
                                        isRemovable: true,
                                        isSystemTag: false,
                                        tag: _.trim()
                                    })).filter(_ => _.tag != "")
                                ],
                                timestamp: new Date().getTime()
                            }
                        ],
                        tags: [
                            {
                                isRemovable: false,
                                isSystemTag: true,
                                tag: uploadedWord.type
                            },
                            ...(uploadedWord?.tags?.split(",") || []).map(_ => ({
                                isRemovable: true,
                                isSystemTag: false,
                                tag: _.trim()
                            })).filter(_ => _.tag != "")
                        ],
                        meta: uploadedWord.meta
                    };
                    firebase.ref(`/org/${org}/words`).push(word);
                });
            }
            setErrors(["successfully added words!"])

        }}></Button>
        <hr />
        <ol>
            {errors.map((v, i) => <li key={i}>{v}</li>)}
        </ol>
    </div>
    {/* </HasPerm> */ }
}
function Page({ org }) {
    return <>
        <TopBar org={org}></TopBar>
        <Tabs>
            {/* <HasPerm perm={SCOPES.ORG_ADMIN_MANAGE_USERS} org={org}> */}
            <Tab id="manage-users" title="Manage Users" panel={<ManageUsers org={org} />} />
            <Tab id="upload" title="Upload Words" panel={<UploadWords org={org} />} />
            {/* </HasPerm> */}
        </Tabs>
    </>
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { org: req.query.org };
}
export default Exported;