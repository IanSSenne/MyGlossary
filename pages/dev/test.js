import React, { useState } from "react";
import { Wrap } from "../../components/wrap";
import dynamic from 'next/dynamic'
import HTML from "../../components/HTML";


function Page({ children, isServer }) {
    const [text, setText] = useState("");
    return (
        <>
            <textarea value={text} readOnly></textarea>
            <hr />
            <HTML>{text}</HTML>
        </>
    );
}
export default ({ isServer }) => <Wrap><Page isServer={isServer}></Page></Wrap>
