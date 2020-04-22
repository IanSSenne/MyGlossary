import React from "react";
import { Wrap } from "../components/wrap";
import { TopBar } from "../components/TopBar";
import { AnchorButton } from "@blueprintjs/core";
import Link from "next/link";


function Page(props) {
    console.log(props);
    return (
        <div>
            <TopBar></TopBar>
            <h1>{props.error}</h1>
            <Link href="/home">
                <AnchorButton>Goto Home</AnchorButton>
            </Link>
        </div >
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { error: req.query.error || "unknown error" }
}
export default Exported;