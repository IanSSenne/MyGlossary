import React, { useState, useEffect } from "react";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { Card, Classes, Divider } from "@blueprintjs/core";
import HTML from "./HTMLRender";
import Link from "next/link";
function Bookmark(props) {
    const [, word] = props.book;
    const [dbword, setdbword] = useState();
    const firebase = useFirebase();
    if (!dbword) {
        firebase.ref(`/org/${word.org}/words/${word.word}`).on("value", (snapshot) => {
            setdbword(snapshot.val());
        });
        return null;
    }
    return <Link>
        <Card interactive onClick={() => { }}>
            <h1 className={Classes.HEADING}>{dbword.word}</h1>
            <HTML>{dbword.definition}</HTML>
            <Divider></Divider>
            <p style={{ color: "gray" }} className={Classes.SMALL}>in {word.org}</p>
        </Card>
    </Link>
}
export function Bookmarks() {
    const firebase = useFirebase();
    const auth = useSelector(state => state.firebase.auth);
    const [bookmarks, setBookmarks] = useState();
    if (!bookmarks) {
        firebase.ref(`users/${auth.uid}/bookmarked`).orderByKey().on("value", (snapshot) => {
            const bookmarks = snapshot.val() || [];
            setBookmarks(Object.entries(bookmarks));
        })
    }
    return <ul style={{
        listStyle: "none",
        padding: 0
    }}>
        {!Boolean(bookmarks) ? <li>"loading..."</li> : (bookmarks.length === 0 ? <li>"no bookmarks found."</li> : bookmarks.map((_, i) => <li key={i}><Bookmark book={_}></Bookmark></li>))}
    </ul>;
}
