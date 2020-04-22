import React from "react";
import { Wrap } from "../components/wrap";
import { TopBar } from "../components/TopBar";
import { AnchorButton } from "@blueprintjs/core";
import Link from "next/link";


function Page(props) {
    return (
        <div>
            <TopBar></TopBar>
            <div style={{
                display: "flex",
                alignContent: "center"
            }}>
                <h1>404</h1>
                <p>page not found!</p>
                <Link href="/home">
                    <AnchorButton>Goto Home</AnchorButton>
                </Link>
            </div>
        </div >
    );
}
const Exported = (props) => <Wrap><Page></Page></Wrap>
export default Exported;