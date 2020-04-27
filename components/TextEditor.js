import dynamic from "next/dynamic";

import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import React from "react";
export default function TextEditor(props) {
    return <div style={{ backgroundColor: "white" }}>
        <ReactQuill {...props}></ReactQuill>
    </div>
}
// {/* <ReactQuill value={text} onChange={(newText, ...a) => {
//     setText(newText);
// }}></ReactQuill> */}