import React, { useEffect, useState } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../../components/wrap";
import IsAuthenticated from "../../../components/auth/IsAuthenticated";
import { TopBar } from "../../../components/TopBar";
import { Card, Classes, Tree, Icon, Intent, Button, Dialog } from "@blueprintjs/core";
import { ref } from "../../../helpers/fb";
import Redirect from "../../../components/redirect";
import { useFirebase } from "react-redux-firebase";

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
                        firebase.ref(`users/${uid}/joined`).push(org);
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
    useEffect(() => {
        firebase.ref(`org/${org}/user`).orderByValue().on("value", async (snapshot) => {
            const users = snapshot.val();
            const val = Object.entries(users);
            const verified = [];
            const unverified = [];
            console.log("val", val);
            const p = [];
            for (let i = 0; i < val.length; i++) {
                p.push(new Promise((resolve) => {
                    firebase.ref(`users/${val[i][0]}/displayName`).on("value", (snapshot) => {
                        console.log(snapshot.val());
                        resolve(snapshot.val());
                    })
                }).then((data) => {
                    console.log(data);
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
            </IsAuthenticated>
        </div>
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { org: req.query.org };
}
export default Exported;