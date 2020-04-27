import React, { useEffect, useState } from "react";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { Wrap } from "../../../../../components/wrap";
import { TopBar } from "../../../../../components/TopBar";
import { useRouter } from "next/router";
import { Card, Tag, Intent } from "@blueprintjs/core";
import HTML from "../../../../../components/HTMLRender";
import { ref } from "../../../../../helpers/fb";


function hashCode(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function Word(props) {
    const { word, uid, org } = props;
    const firebase = useFirebase();
    const auth = useSelector(state => state.firebase.auth);
    const [isBookmarked, setIsBookmarked] = useState();
    if (isBookmarked === undefined) {
        (async () => {
            setIsBookmarked(await ref.exists(firebase.ref(`users/${auth.uid}/bookmarked/${hashCode(org).toString(36)}-${hashCode(uid).toString(36)}`)))
        })();
    }
    const router = useRouter();
    return <Card className="word-container" style={{ height: "200px", minWidth: "200px" }}>
        <div style={{ textAlign: "center", color: "black" }}>
            <h3>{word.word}</h3>
            <div style={{
                overflowY: "hidden",
                height: "100px"
            }}><HTML>{word.definition}</HTML></div>
            {word.tags.map((_, i) =>
                <a onClick={(e) => {
                    router.replace(`/org/[org]/search/tag/[query]`, `/org/${org}/search/tag/${_.tag}`);
                }} minimal>
                    <Tag className="word-tag" minimal interactive intent={_.isSystemTag ? Intent.SUCCESS : Intent.NONE}>{_.tag}</Tag>
                </a>)}
        </div>
    </Card>
}

function Page(props) {
    const { org, query } = props.query
    const firebase = useFirebase();
    const auth = useSelector(state => state.firebase.auth);
    const [data, setData] = useState(null);
    useEffect(() => {
        firebase.ref(`/org/${org}/words`).on("value", (snap) => {
            setData(snap.val());
        })
    }, []);
    return (
        <div>
            <TopBar org={org}></TopBar>
            {data && <div style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                paddingTop: 8,
            }}>{Object.entries(data).filter((entry) => {
                const [uid, word] = entry;
                return word.tags.find((tag) => {
                    return tag.tag === query
                })
            }).map(_ => <Word key={_[0]} org={org} uid={_[0]} word={_[1]}></Word>)}</div>}
        </div>
    );
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
    return { query: req.query };
}
export default Exported;