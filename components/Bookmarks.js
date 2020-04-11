import React, { useState, useEffect } from "react";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
export function Bookmarks() {
    const firebase = useFirebase();
    const auth = useSelector(state => state.firebase.auth);
    const [bookmarks, setBookmarks] = useState();
    if (!bookmarks) {
        firebase.ref(`users/${auth.uid}/bookmarks`).orderByKey().once("value", (snapshot) => {
            const bookmarks = snapshot.val() || [];
            setBookmarks(bookmarks);
        })
    }
    return <ul>
        {!Boolean(bookmarks) ? <li>"loading..."</li> : (bookmarks.length === 0 ? <li>"no bookmarks found."</li> : bookmarks.map(_ => <li>{JSON.stringify(_)}</li>))}
    </ul>;
}
