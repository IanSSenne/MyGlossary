import React from "react";
export default function HTML({ children }) {
    const workingChildren = children.filter(Boolean);
    for (let child of workingChildren) {
        if (typeof child != "string") {
            throw new Error("HTML expects only strings");
        }
    }
    return <div dangerouslySetInnerHTML={{ __html: workingChildren.join("") }} />
}