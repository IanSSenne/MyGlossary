import React from "react";
import { Wrap } from "../../components/wrap";
import "react-quill/dist/quill.snow.css";
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });


function Page({ children, isServer }) {
    return (
        <ReactQuill onChange={(...args) => console.log(args)}></ReactQuill>
    );
}
export default ({ isServer }) => <Wrap><Page isServer={isServer}></Page></Wrap>
