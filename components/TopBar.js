import React, { useState } from "react";
import "@blueprintjs/core/lib/css/blueprint.css";
import { Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Classes, Alignment, Button, Drawer, AnchorButton } from "@blueprintjs/core";
import IsAuthenticated from "./auth/IsAuthenticated";
import { useFirebase } from "react-redux-firebase";
import { Bookmarks } from "./Bookmarks";
import IsAdmin from "./auth/IsAdmin";
import Link from "next/link";
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
                    <Link href="/org/[org]/landing" as={`/org/${org}/landing`}>
                        <AnchorButton className={Classes.MINIMAL} text={org} />
                    </Link>
                    <NavbarDivider />
                </>}

                <IsAuthenticated>
                    <Link href="/portal">
                        <AnchorButton className={Classes.MINIMAL} icon="applications" text="My Organizations" />
                    </Link>
                </IsAuthenticated>
            </NavbarGroup>

            <IsAuthenticated target="unauthenticated">

                <NavbarGroup align={Alignment.RIGHT}>
                    <NavbarDivider />
                    <Link href="/login">
                        <AnchorButton className={Classes.MINIMAL}>Login</AnchorButton>
                    </Link>
                </NavbarGroup>
            </IsAuthenticated>
            <IsAuthenticated>
                <NavbarGroup align={Alignment.RIGHT}>

                    {props.org && <IsAdmin org={props.org}>
                        <NavbarDivider />
                        <Link href="/org/[org]/admint" as={`/org/${props.org}/admin`}>
                            <AnchorButton className={Classes.MINIMAL}>Admin</AnchorButton>
                        </Link>
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
