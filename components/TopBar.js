import React, { useState } from "react";
import "@blueprintjs/core/lib/css/blueprint.css";
import { Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Classes, Alignment, Button, Drawer } from "@blueprintjs/core";
import IsAuthenticated from "./auth/IsAuthenticated";
import { useFirebase } from "react-redux-firebase";
import { Bookmarks } from "./Bookmarks";
import IsAdmin from "./auth/IsAdmin";
export function TopBar(props) {
    const { org } = props;
    const firebase = useFirebase();
    const [isBookmarksVisible, setIsBookmarksVisible] = useState(false);
    return <>
        <Navbar className={Classes.DARK}>
            <NavbarGroup align={Alignment.LEFT}>
                <NavbarHeading>MyGlossary</NavbarHeading>
                {org && <>
                    <NavbarDivider />
                    <Button className={Classes.MINIMAL} text={org} onClick={() => {
                        window.location.replace(`/org/${org}/landing`)
                    }} />
                    <NavbarDivider />
                </>}

                <IsAuthenticated>
                    <Button className={Classes.MINIMAL} icon="applications" text="My Organizations" onClick={
                        () => {
                            window.location.replace("/portal")
                        }
                    } />
                </IsAuthenticated>
            </NavbarGroup>

            <IsAuthenticated target="unauthenticated">

                <NavbarGroup align={Alignment.RIGHT}>
                    <NavbarDivider />
                    <Button onClick={() => {
                        window.location.replace("/login");
                    }} className={Classes.MINIMAL}>Login</Button>
                </NavbarGroup>
            </IsAuthenticated>
            <IsAuthenticated>
                <NavbarGroup align={Alignment.RIGHT}>

                    {props.org && <IsAdmin org={props.org}>
                        <NavbarDivider />
                        <Button className={Classes.MINIMAL} onClick={() => {
                            window.location.replace(`/org/${props.org}/admin`);
                        }}>Admin</Button>
                    </IsAdmin>}
                    <NavbarDivider />

                    <Button className={Classes.MINIMAL} icon="book" onClick={() => {
                        setIsBookmarksVisible(true);
                    }} />
                    <NavbarDivider />
                    <Button className={Classes.MINIMAL} onClick={() => {
                        firebase.logout();
                    }}>Logout</Button>
                </NavbarGroup>
            </IsAuthenticated>
        </Navbar>

        <Drawer
            icon="info-sign"
            isOpen={isBookmarksVisible}
            hasBackdrop={false}
            title="Bookmarks!"
            size={Drawer.SIZE_SMALL}
            canOutsideClickClose={true}
            canEscapeKeyClose={true}
            onClose={() => setIsBookmarksVisible(false)}
            style={{ overflowY: "scroll" }}
        >
            <Bookmarks org={org}></Bookmarks>
        </Drawer>
    </>;
}
