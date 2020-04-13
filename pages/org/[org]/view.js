import React, { useEffect, useState } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../../components/wrap";
import IsAuthenticated from "../../../components/auth/IsAuthenticated";
import { TopBar } from "../../../components/TopBar";
import { Card, Classes, Dialog, Button, InputGroup, HTMLSelect, Tag, Intent, Navbar, Alignment, Popover, Menu, MenuItem, Position, Tooltip, TextArea } from "@blueprintjs/core";
import Redirect from "../../../components/redirect";
import { useFirebase } from "react-redux-firebase";
import { useSelector, useStore } from "react-redux";
import { ref } from "../../../helpers/fb";
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
	const [wordEditorVisible, setWordEditorVisible] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState();
	if (isBookmarked === undefined) {
		(async () => {
			setIsBookmarked(await ref.exists(firebase.ref(`users/${auth.uid}/bookmarked/${hashCode(org).toString(36)}-${hashCode(uid).toString(36)}`)))
		})();
	}
	return <>
		<Card className="word-container" interactive onClick={() => setWordEditorVisible(true)} style={{ height: "200px", minWidth: "200px" }}>
			<div style={{ textAlign: "center", color: "black" }}>
				<h3>{word.word}</h3>
				<p>{word.definition}</p>
				{word.tags.map((_, i) => <Tag key={i} minimal interactive intent={_.isSystemTag ? Intent.SUCCESS : Intent.NONE}>{_.tag}</Tag>)}
			</div>
		</Card>
		<Dialog isOpen={wordEditorVisible} title={`Edit "${word.word}"`} onClose={() => setWordEditorVisible(false)}>
			<div className={Classes.DIALOG_BODY}>
			</div>
			<div className={Classes.DIALOG_FOOTER}>
				<div className={Classes.DIALOG_FOOTER_ACTIONS}>
					<Button icon="bookmark" intent={isBookmarked ? Intent.SUCCESS : Intent.NONE} onClick={async () => {
						const path = firebase.ref(`users/${auth.uid}/bookmarked/${hashCode(org).toString(36)}-${hashCode(uid).toString(36)}`);
						if (await ref.exists(path)) {
							path.remove();
							setIsBookmarked(false);
						} else {
							path.set({ word: uid, org });
							setIsBookmarked(true);
						}
					}} small></Button>
					<Button onClick={() => {
					}}>Save</Button>
				</div>
			</div>
		</Dialog>
	</>;
}

function Page({ org }) {
	const firebase = useFirebase();
	const [words, setWords] = useState();
	const [addWordVisible, setAddWordVisible] = useState(false);
	const [newWord, setNewWord] = useState("");
	const [newWordInitialTag, setNewWordInitialTag] = useState("term");
	const [sortType, setSortType] = useState("initial");
	const [newWordDef, setNewWordDef] = useState("");
	// const auth = useSelector(state => state.firebase.auth);
	if (!Boolean(words)) {
		const orgRef = firebase.ref(`/org/${org}`);
		orgRef.child("words").orderByKey().on("value", (snap) => {
			const val = snap.val();
			setWords(val ? Object.entries(val) : []);
		})
	}
	const sortMenu = (
		<Menu>
			{/* <MenuItem icon={"sort"} text="creation order" shouldDismissPopover onClick={() => {
				setSortType("initial");
			}}></MenuItem> */}
			<MenuItem icon={"sort-alphabetical"} text="A to Z" shouldDismissPopover onClick={() => {
				setSortType("a-z");
			}}></MenuItem>
			<MenuItem icon={"sort-alphabetical-desc"} text="Z to A" shouldDismissPopover onClick={() => {
				setSortType("z-a");
			}}></MenuItem>
		</Menu>
	);
	const sortIcons = {
		initial: "sort",
		"a-z": "sort-alphabetical",
		"z-a": "sort-alphabetical-desc"
	}
	return (
		<div>
			<TopBar org={org}></TopBar>
			<Navbar>
				<Navbar.Group align={Alignment.LEFT}>
					<Popover content={sortMenu}>
						<Tooltip content="Sort!" position={Position.BOTTOM_RIGHT}>
							<Button icon={sortIcons[sortType]}></Button>
						</Tooltip>
					</Popover>
					<Tooltip content="Filter Results" position={Position.BOTTOM_LEFT}>
						<Button icon="filter-list" onClick={() => setAddWordVisible(true)}></Button>
					</Tooltip>
				</Navbar.Group>
				<Navbar.Group align={Alignment.RIGHT}>
					<Tooltip content="Add a term!" position={Position.BOTTOM_LEFT}>
						<Button icon="plus" onClick={() => setAddWordVisible(true)}></Button>
					</Tooltip>
				</Navbar.Group>
			</Navbar>
			<IsAuthenticated target="unauthenticated">
				<Redirect target="/"></Redirect>
			</IsAuthenticated>
			<IsAuthenticated>
				{!Boolean(words) ? "loading..." : <div style={{
					display: "flex",
					flexDirection: "row",
					flexWrap: "wrap",
					justifyContent: "center",
					paddingTop: 8,
				}}>
					{(sortType === "initial" ? words : words.sort((a, b) => {
						if (sortType === "a-z") return a[1].word.toLowerCase().localeCompare(b[1].word.toLowerCase());
						return b[1].word.toLowerCase().localeCompare(a[1].word.toLowerCase());
					})).map(_ => <Word key={_[0]} org={org} uid={_[0]} word={_[1]}></Word>)}

				</div>}
				<Dialog
					autoFocus={true}
					canEscapeKeyClose={true}
					canOutsideClickClose={true}
					enforceFocus={true}
					isOpen={addWordVisible}
					icon="info-sign"
					onClose={() => {
						setAddWordVisible(false);
						setNewWord("");
					}}
					title="Add a term."
				>
					<div className={Classes.DIALOG_BODY}>
						<p>Please enter the term to add</p>
						<InputGroup onChange={(evt) => setNewWord(evt.target.value)} value={newWord}></InputGroup>
						<br />
						<p>definition</p>
						<TextArea fill value={newWordDef} onChange={(evt) => setNewWordDef(evt.target.value)}></TextArea>
						<br />
						<p>Type</p>
						<HTMLSelect value={newWordInitialTag} onChange={(evt) => setNewWordInitialTag(evt.target.value)}>
							<option value="term">Glossary Term</option>
							<option value="acronym">Acronym</option>
						</HTMLSelect>
					</div>
					<div className={Classes.DIALOG_FOOTER}>
						<div className={Classes.DIALOG_FOOTER_ACTIONS}>
							<Button onClick={() => {
								firebase.ref(`org/${org}/words`).push({ word: newWord, tags: [{ isRemovable: false, tag: newWordInitialTag, isSystemTag: true }], definition: newWordDef });
								setNewWord("");
								setNewWordInitialTag("term");
								setAddWordVisible(false);
								setNewWordDef("");
							}}>Add</Button>
						</div>
					</div>
				</Dialog>
			</IsAuthenticated>
		</div>
	);
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
	return { org: req.query.org };
}
export default Exported;