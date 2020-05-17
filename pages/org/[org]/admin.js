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
import HasPerm from "../../../components/HasPerm";
import SCOPES from "../../../helpers/scopes";
import config from "../../../helpers/config";
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
                        firebase.ref(`org/${org}/users/${uid}/accepted`).set(true);
                        firebase.ref(`org/${org}/users/${uid}/scopes`).set([
                            SCOPES.WORD_EDIT_WORD,
                            SCOPES.WORD_REMOVE_WORD,
                            SCOPES.WORD_APROVE_WORD,
                            SCOPES.WORD_SET_DEFINITION,
                            SCOPES.WORD_CREATE
                        ]);

                        firebase.ref(`org/${org}/users/${uid}/scopes`)
                        firebase.ref(`users/${uid}/joined`).push({ name: org });
                        setUserUIVisible(false);
                    }}></Button>
                    <Button icon="plus" intent={Intent.DANGER} text={"decline user"} onClick={() => {
                        firebase.ref(`org/${org}/users/${uid}`).remove();
                        setUserUIVisible(false);
                    }}></Button>
                </>)}

                {meta.accepted && (<Button intent={Intent.DANGER} onClick={() => {
                    firebase.ref(`org/${org}/users/${uid}/accepted`).set(true);
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
        <br />
    </>
}

function Page({ children, org }) {
    const firebase = useFirebase();
    const [fileUpload, setFileUpload] = useState("");
    const [files, setFiles] = useState();
    const [errors, setErrors] = useState([]);
    const [verifiedUsers, setVerifiedUsers] = useState([]);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    useEffect(() => {
        firebase.ref(`org/${org}/users`).on("value", async (snapshot) => {
            const users = snapshot.val();
            if (!users) {
                return;
            }
            const val = Object.entries(users);
            const verified = [];
            const unverified = [];
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
            setVerifiedUsers(verified.map((user, index) => (<AdminUserInterface key={index} user={user} org={org}></AdminUserInterface>)));
            setUnverifiedUsers(unverified.map((user, index) => (<AdminUserInterface key={index} user={user} org={org}></AdminUserInterface>)));
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
                                <HasPerm perm={SCOPES.ORG_ADMIN_MANAGE_USERS} org={org}>
                                    <h1 className={Classes.HEADING}>Manage Users</h1>
                                    <h3>unverified</h3>
                                    {unverifiedUsers}
                                    <h3>verified</h3>
                                    {verifiedUsers}
                                </HasPerm>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <HasPerm perm={SCOPES.ORG_ADMIN_UPLOAD_WORDS} org={org}>
                                    <div style={{ display: "flex", verticalAlign: "center" }}>
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

                                                const internal = ["type", "definition", "word", "tags"];
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
                                </HasPerm>
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