import React, { useEffect, useState } from "react";
// import { useFirebase } from "react-redux-firebase";
// import { useSelector, useStore } from "react-redux";
import { Wrap } from "../../../components/wrap";
import IsAuthenticated from "../../../components/auth/IsAuthenticated";
import { TopBar } from "../../../components/TopBar";
import { Card, Classes, Dialog, Button, InputGroup, HTMLSelect, Tag, Intent, Navbar, Alignment, Popover, Menu, MenuItem, Position, Tooltip } from "@blueprintjs/core";
import Redirect from "../../../components/redirect";
import { useFirebase } from "react-redux-firebase";
function Word(props) {
	const { word } = props;
	return <Card className="word-container" interactive style={{ height: "200px", minWidth: "200px", display: "table-cell", position: "relative", margin: "5px" }}>
		<div style={{ textAlign: "center", color: "gray", position: "absolute", top: "50%", transform: "translateY(-50%)" }}>
			<h3>{word.word}</h3>
			{word.tags.map((_, i) => <Tag key={i} minimal interactive intent={_.isSystemTag ? Intent.SUCCESS : Intent.NONE}>{_.tag}</Tag>)}
		</div>
	</Card>;
}

function Page({ org }) {
	const firebase = useFirebase();
	const [words, setWords] = useState();
	const [addWordVisible, setAddWordVisible] = useState(false);
	const [newWord, setNewWord] = useState("");
	const [newWordInitialTag, setNewWordInitialTag] = useState("term");
	const [sortType, setSortType] = useState("initial");
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
					{/* <HTMLSelect>

						<option value="stored"><Icon>sort</Icon></option>
						<option value="a-z"><Icon>sort-alphabetical</Icon></option>
						<option value="z-a"><Icon>sort-alphabetical-desc</Icon></option>
					</HTMLSelect> */}
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
					})).map(_ => <Word key={_[0]} word={_[1]}></Word>)}

				</div>}
				{addWordVisible && <Dialog
					autoFocus={true}
					canEscapeKeyClose={true}
					canOutsideClickClose={true}
					enforceFocus={true}
					isOpen={true}
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
						<p>Type</p>
						<HTMLSelect value={newWordInitialTag} onChange={(evt) => setNewWordInitialTag(evt.target.value)}>
							<option value="term">Glossary Term</option>
							<option value="acronym">Acronym</option>
						</HTMLSelect>
					</div>
					<div className={Classes.DIALOG_FOOTER}>
						<div className={Classes.DIALOG_FOOTER_ACTIONS}>
							<Button onClick={() => {
								firebase.ref(`org/${org}/words`).push({ word: newWord, tags: [{ isRemovable: false, tag: newWordInitialTag, isSystemTag: true }] });
								setNewWord("");
								setNewWordInitialTag("term");
								setAddWordVisible(false);
							}}>Add</Button>
						</div>
					</div>
				</Dialog>}
			</IsAuthenticated>
		</div>
	);
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
	return { org: req.query.org };
}
export default Exported;