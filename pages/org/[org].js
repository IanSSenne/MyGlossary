import React, { useEffect, useState } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../components/wrap";
import IsAuthenticated from "../../components/auth/IsAuthenticated";
import { TopBar } from "../../components/TopBar";
import { Card, Classes, Icon, Tag, Intent, Button } from "@blueprintjs/core";
import { ref } from "../../helpers/fb";
import Redirect from "../../components/redirect";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import HTML from "../../components/HTML";

function hashCode(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function Word({ id, word, org }) {
    const firebase = useFirebase();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const auth = useSelector(state => state.firebase.auth);
    useEffect(() => {
        (async () => {
            setIsBookmarked(await ref.exists(firebase.ref(`users/${auth.uid}/bookmarked/${hashCode(org).toString(36)}-${hashCode(id).toString(36)}`)))
        })();
    }, []);



    return <Card key={id}>
        <Button icon="bookmark" intent={isBookmarked ? Intent.SUCCESS : Intent.NONE} onClick={async () => {
            const path = firebase.ref(`users/${auth.uid}/bookmarked/${hashCode(org).toString(36)}-${hashCode(id).toString(36)}`);
            if (await ref.exists(path)) {
                path.remove();
                setIsBookmarked(false);
            } else {
                path.set({ word: id, org });
                setIsBookmarked(true);
            }
        }} small></Button>
        <h1 className={Classes.HEADING}>{word.word}</h1>
        <HTML>{word.definition}</HTML>

        {word.tags.map((tag, i) => <Tag
            style={{ marginLeft: "5px" }}
            intent={tag.isSystemTag ? Intent.SUCCESS : Intent.NONE}
            key={i}>
            {tag.tag}
        </Tag>)}
    </Card>
}
function Page({ children, org }) {
    const firebase = useFirebase();
    const [words, setWords] = useState();
    useEffect(() => {
        const orgRef = firebase.ref(`/org/${org}`);
        orgRef.child("words").on("value", (snap) => {
            setWords(snap.val() || []);
        })
    }, []);
    return (
        <div>
            <TopBar org={org}></TopBar>
            {words && Object.entries(words).map(([id, word]) => <Word id={id} word={word} org={org} key={id}></Word>)}
        </div>
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { org: req.query.org };
}
export default Exported;