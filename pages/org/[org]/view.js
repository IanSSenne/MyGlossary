import React, { useEffect, useState } from "react";
import { Wrap } from "../../../components/wrap";
import IsAuthenticated from "../../../components/auth/IsAuthenticated";
import { TopBar } from "../../../components/TopBar";
import { TagInput, Card, Classes, Dialog, Button, InputGroup, HTMLSelect, Tag, Intent, Navbar, Alignment, Popover, Menu, MenuItem, Position, Tooltip, Icon } from "@blueprintjs/core";
import Redirect from "../../../components/redirect";
import { useFirebase } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { ref } from "../../../helpers/fb";
import TextEditor from "../../../components/TextEditor";
import HTML from "../../../components/HTMLRender";
import "../../../scss/org/view.scss"
import { useRouter } from "next/router";
import IsAllowed from "../../../components/auth/IsAllowed";
import HasPerm from "../../../components/HasPerm";
import scopes from "../../../helpers/scopes";
import { EditHistory } from "../../../components/EditHistory";
import { MultiSelect } from "@blueprintjs/select";
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

function Word(props) {
	const { word, uid, org, setFilters, filters } = props;
	const firebase = useFirebase();
	const auth = useSelector(state => state.firebase.auth);
	const [wordEditorVisible, setWordEditorVisible] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState();
	const [editorValue, setEditorValue] = useState(word.definition);
	const [editorTags, setEditorTags] = useState(word.tags.filter(_ => !_.isSystemTag).map(_ => _.tag));
	useEffect(() => {
		(async () => {
			setIsBookmarked(await ref.exists(firebase.ref(`users/${auth.uid}/bookmarked/${hashCode(org).toString(36)}-${hashCode(uid).toString(36)}`)))
		})();
	}, []);
	const [canEditorBeVisible, setCanEditorBeVisible] = useState(true);
	return <>
		<Card className="word-container" interactive onClick={() => setWordEditorVisible(true)} style={{ minWidth: "200px" }}>
			<div style={{ color: "black" }}>
				<h1>{word.word}</h1>
				<div><HTML>{word.definition}</HTML></div>
				{word.tags.map((_, i) =>
					<a onClick={(e) => {
						setCanEditorBeVisible(false);
						setFilters({ ...filters, tags: [_.tag] })
					}}
						key={i}>
						<Tag className="word-tag" minimal interactive intent={_.isSystemTag ? Intent.SUCCESS : Intent.NONE}>{_.tag}</Tag>
					</a>)}
			</div>
		</Card>
		<Dialog isOpen={canEditorBeVisible && wordEditorVisible} title={`Edit "${word.word}"`} onClose={() => setWordEditorVisible(false)}>
			<div className={Classes.DIALOG_BODY}>
				<h2>Description</h2>
				<TextEditor defaultValue={word.definition} onChange={(evt) => {
					setEditorValue(evt)
				}}></TextEditor>
				<h2>Tags</h2>
				<TagInput
					fill
					values={editorTags}
					onChange={(tags) => {
						setEditorTags(Array.from(new Set(tags)));
					}}
				></TagInput>
				<hr />
				<h2 className={Classes.HEADING}>History</h2>
				<EditHistory word={word} org={org} id={uid}></EditHistory>
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
						firebase.ref(`/org/${org}/words/${uid}/history`).push({
							author: auth.uid,
							definition: editorValue,
							tags: [...word.tags.filter(_ => _.isSystemTag), ...editorTags.map(_ => {
								return {
									isRemovable: true, tag: _, isSystemTag: false
								}
							})],
							timestamp: new Date().getTime()
						});
						firebase.ref(`/org/${org}/words/${uid}`).update({
							tags: [...word.tags.filter(_ => _.isSystemTag), ...editorTags.map(_ => {
								return {
									isRemovable: true, tag: _, isSystemTag: false
								}
							})]
						});
						firebase.ref(`/org/${org}/words/${uid}`).update({ definition: editorValue });
						setEditorTags(word.tags.filter(_ => !_.isSystemTag).map(_ => _.tag));
						setEditorValue(word.definition);
						setWordEditorVisible(false);
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
	const [filterResultsVisible, setFilterResultsVisible] = useState(false);
	const [newWord, setNewWord] = useState("");
	const [newWordInitialTag, setNewWordInitialTag] = useState("term");
	const [sortType, setSortType] = useState("initial");
	const [newWordDef, setNewWordDef] = useState("");
	const [tags, setTags] = useState([]);
	const [searchEdits, setSearchEdits] = useState({ tags: [], term: "" });
	const [filterTags, setFilterTags] = useState([]);
	const [tagList, setTagList] = useState([]);
	const auth = useSelector(state => state.firebase.auth);
	const router = useRouter();
	let o;
	try {
		o = JSON.parse(router.query.filter);
		o.term = o.term || "";
		o.tags = Array.isArray(o.tags) ? o.tags : [];
	} catch{
		o = { tags: [], term: "" };
	}
	const [filters, setFilters] = useState(o);
	const filterRegExp = new RegExp(filters?.term || "", "i");
	useEffect(() => {
		const tagSet = new Set();
		if (words) {
			words.forEach(([, word]) => {
				word.tags.forEach(tag => tagSet.add(tag.tag))
			});
		}
		setTagList(Array.from(tagSet));
	}, [words]);
	useEffect(() => {
		if ((filters.term != "" || filters.tags.length > 0)) {
			if (router.query.filter !== JSON.stringify(filters)) {
				const stringifiedFilters = JSON.stringify(filters);
				router.replace(`/org/[org]/view?filter=${stringifiedFilters}`, `/org/${org}/view?filter=${stringifiedFilters}`, { shallow: true });
			}
		} else if (router.query.filter) {
			router.replace(`/org/[org]/view`, `/org/${org}/view`, { shallow: true });
		}
	}, [filters]);
	useEffect(() => {
		(async () => {
			if (!(await ref.exists(firebase.ref(`/org/${org}`)))) {
				router.replace(`/home`);
			}
		})();
	}, []);
	useEffect(() => {
		setSearchEdits({
			tags: filterTags,
			term: searchEdits.term
		})
	}, [filterTags])
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
			<IsAllowed org={org}>
				<Navbar>
					<Navbar.Group align={Alignment.LEFT}>
						<Popover content={sortMenu}>
							<Tooltip content="Sort!" position={Position.BOTTOM_RIGHT}>
								<Button icon={sortIcons[sortType]}></Button>
							</Tooltip>
						</Popover>
						<Navbar.Divider></Navbar.Divider>
						<Tooltip content="Filter Results" position={Position.BOTTOM_LEFT}>
							<Button icon="filter-list" onClick={() => setFilterResultsVisible(true)}></Button>
						</Tooltip>
						{
							(filters.term.length + filters.tags.length > 0) && <Tooltip content="Clear Filter" position={Position.BOTTOM}>
								<Button icon="trash" intent={Intent.DANGER} onClick={() => setFilters({ term: "", tags: [] })}></Button>
							</Tooltip>
						}
					</Navbar.Group>
					<HasPerm perm={STATES.WORD_CREATE} org={org}>
						<Navbar.Group align={Alignment.RIGHT}>
							<Tooltip content="Add a term!" position={Position.BOTTOM_LEFT}>
								<Button icon="plus" onClick={() => setAddWordVisible(true)}></Button>
							</Tooltip>
						</Navbar.Group>
					</HasPerm>
				</Navbar>
				<IsAuthenticated target="unauthenticated">
					<Redirect target="/"></Redirect>
				</IsAuthenticated>
				<IsAuthenticated>
					{!Boolean(words) ? "loading..." : <div style={{
						display: "block",
						flexDirection: "row",
						flexWrap: "wrap",
						margin: "1em"
						// justifyContent: "center",
						// gridTemplateColumns: "repeat(auto-fill,minmax(200px,300px))",
						// gridTemplateRows: "repeat(auto-fill,minmax(100px.200px))",
						// gridAutoRows: "auto",
						// gridAutoColumns: "repeat(auto-fill,minmax(200px,300px))",
						// paddingTop: 8,
					}}>
						{(sortType === "initial" ? words : words.sort((a, b) => {
							if (sortType === "a-z") return a[1].word.toLowerCase().localeCompare(b[1].word.toLowerCase());
							return b[1].word.toLowerCase().localeCompare(a[1].word.toLowerCase());
						})).filter(([uid, word]) => {
							let res = true;
							if (filters.term != "") {
								let result = false;
								try {
									const description = new DOMParser().parseFromString(word.definition, "text/html").body.innerText;
									if (filterRegExp.test(description)) {
										result = true;
									} else if (filterRegExp.test(word.word)) {
										result = true;
									}
								} catch{ }
								if (!result) {
									res = false;
								}
							}
							let hasTag = true;
							const tags = word.tags.map(_ => _.tag);
							for (let i = 0; i < filters.tags.length; i++) {
								if (!tags.includes(filters.tags[i])) {
									hasTag = false;
									break;
								}
							}
							if (!hasTag && filters.tags.length > 0) {
								res = false;
							}
							return res;
						}).map((_, i) => <Word filters={filters} setFilters={setFilters} key={i} org={org} uid={_[0]} word={_[1]}></Word>)}
					</div>}
					<HasPerm perm={scopes.WORD_EDIT_WORD} org={org}>
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
								<TextEditor value={newWordDef} onChange={(text) => setNewWordDef(text)}></TextEditor>
								<br />
								<p>Tags</p><TagInput
									fill
									onChange={(values) => {
										setTags(values);
									}}
									placeholder="Separate values with commas..."
									rightElement={<Button
										icon={tags.length > 1 ? <Icon icon="cross"></Icon> : null}
										minimal={true}
										onClick={() => {
											setTags([]);
										}}
									/>}
									values={tags}
								/>
								<p>Type</p>
								<HTMLSelect value={newWordInitialTag} onChange={(evt) => setNewWordInitialTag(evt.target.value)}>
									<option value="term">Glossary Term</option>
									<option value="acronym">Acronym</option>
								</HTMLSelect>
							</div>
							<div className={Classes.DIALOG_FOOTER}>
								<div className={Classes.DIALOG_FOOTER_ACTIONS}>
									<Button onClick={() => {
										firebase.ref(`org/${org}/words`).push({
											word: newWord, tags: [{ isRemovable: false, tag: newWordInitialTag, isSystemTag: true }, ...tags.map(_ => {
												return {
													isRemovable: true, tag: _, isSystemTag: false
												}
											})],
											definition: newWordDef,
											history: [{
												author: auth.uid,
												definition: newWordDef,
												tags: [{ isRemovable: false, tag: newWordInitialTag, isSystemTag: true }, ...tags.map(_ => {
													return {
														isRemovable: true, tag: _, isSystemTag: false
													}
												})],
												timestamp: new Date().getTime()
											}]
										});
										setNewWord("");
										setNewWordInitialTag("term");
										setAddWordVisible(false);
										setNewWordDef("");
										setTags([]);
									}}>Add</Button>
								</div>
							</div>
						</Dialog>
					</HasPerm>
					{words &&
						<Dialog
							autoFocus={true}
							canEscapeKeyClose={true}
							canOutsideClickClose={true}
							enforceFocus={true}
							isOpen={filterResultsVisible}
							icon="info-sign"
							onClose={() => {
								setFilterResultsVisible(false);
							}}
							title="Filter words"
						>
							<div className={Classes.DIALOG_BODY}>
								<strong>Tags</strong>
								<p>please select any tags you wish to filter by.</p>
								<MultiSelect
									fill
									onItemSelect={(toAdd) => {
										if (filterTags.indexOf(toAdd) > -1) {
											setFilterTags(filterTags.filter(item => item != toAdd));
										} else {
											setFilterTags([...filterTags, toAdd])
										}
									}}
									tagInputProps={{
										onRemove(tag, index) {
											setFilterTags(filterTags.filter(item => item != tag));
										}
									}}
									items={tagList}
									itemRenderer={(item, { modifiers, handleClick }) => {
										return <MenuItem
											active={modifiers.active}
											icon={filterTags.indexOf(item) > -1 ? "tick" : "blank"}
											key={item}
											onClick={handleClick}
											text={item}
											shouldDismissPopover={false}
										/>
									}}
									noResults={<MenuItem disabled={true} text="No results." />}
									selectedItems={filterTags}
									tagRenderer={item => item}

								></MultiSelect>
								<hr />
								<strong>Term</strong>
								<p>please enter a term to filter by. (empty to omit)</p>
								<InputGroup value={searchEdits.term} onChange={evt => {
									setSearchEdits({ tags: searchEdits.tags, term: evt.target.value });
								}}></InputGroup>
							</div>
							<div className={Classes.DIALOG_FOOTER}>
								<div className={Classes.DIALOG_FOOTER_ACTIONS}>
									<Button onClick={() => {
										setSearchEdits({ tags: [], term: "" });
										setFilterTags([]);
									}} icon="trash" intent={Intent.DANGER}></Button>
									<Button onClick={() => {
										setFilters(searchEdits);
									}}>Apply</Button>
								</div>
							</div>
						</Dialog>
					}
				</IsAuthenticated>
			</IsAllowed>
		</div >
	);
}
const Exported = (props) => <Wrap><Page {...props}></Page></Wrap>
Exported.getInitialProps = async (req) => {
	return { org: req.query.org };
}
export default Exported;