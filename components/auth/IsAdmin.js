import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useFirebase } from "react-redux-firebase";

export default function IsAdmin({ org, children }) {
    const firebase = useFirebase();
    const auth = useSelector(state => state.firebase.auth);
    useEffect(() => {
        firebase.ref(`org/${org}/owner`).once("value", (snap) => {
            setIsAdmin(snap.val() === auth.uid);
        })
    }, []);
    const [isAdmin, setIsAdmin] = useState(false);

    if (!isAdmin) return null;
    return children;
}