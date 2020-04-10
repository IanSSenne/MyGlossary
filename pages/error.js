import React from "react";
import { Wrap } from "../components/wrap";
import { TopBar } from "../components/TopBar";
import { AnchorButton } from "@blueprintjs/core";


function Page(props) {
    console.log(props);
    return (
        <div>
            <TopBar></TopBar>
            <h1>{props.error}</h1>
            <AnchorButton href="/home">Goto Home</AnchorButton>
        </div >
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { error: req.query.error || "unknown error" }
}
export default Exported;