import type { TableNodeData, TreeNodeData } from '../../../data/TreeNodeData'
import { useState } from 'react'
import '../../../assets/Node.css'
import { TableNodeBox } from './TableNodeBox'
import AddRuleDialog, { getPredicateParts } from './AddRuleDialog'
import {Tooltip } from '@mui/material'
import { TbFocus2 } from 'react-icons/tb'
import { greyedButtonStyle, NORMAL_HEIGHT } from '../../../types/constants'
import { FaCodeFork, FaCodePullRequest } from 'react-icons/fa6'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import type { Rule, TableEntryResponse } from '../../../types/types'
import PositionDialog from './PositionDialog'


type NodeProps = {
    node: TableNodeData,
    mode: 'explore' | 'query';
    focusClicked: TreeNodeData | null;
    setFocusClicked: (node: TreeNodeData | null) => void;
    onAddAboveButtonClick: (ruleId: Rule, index: number) => void;
    onAddBelowButtonClick: (node: TableNodeData, ruleId: Rule) => void;
    giveRemoveAbovePreview: (node: TreeNodeData) => void;
    onRemoveButtonClick: (node: TreeNodeData) => void;
    onCollapseButtonClick: (node: TreeNodeData, bool: boolean) => void;
    onNodeClicked: (node: TreeNodeData) => void;
    onMouseLeftButton: () => void;
    onRowClicked: (row: TableEntryResponse, predicate: string) => void;
    onFocusButtonClick: (node: TableNodeData, bool: boolean) => void;
    isHovered?: boolean;
    onPopOutClicked: (node: TableNodeData) => void;
    codingButtonClicked: (node: TableNodeData) => void;
    setHoveredNode: (node: TreeNodeData | null) => void;
}

export default function TableNode({
    node,
    mode,
    focusClicked,
    setFocusClicked,
    onAddAboveButtonClick,
    onAddBelowButtonClick,
    onMouseLeftButton,
    onRemoveButtonClick,
    onCollapseButtonClick,
    giveRemoveAbovePreview,
    onNodeClicked,
    onRowClicked,
    onFocusButtonClick,
    isHovered,
    setHoveredNode,
    onPopOutClicked
}: Readonly<NodeProps>) {
    const [hovered, setHovered] = useState(false)
    const [activeDialog, setActiveDialog] = useState<"above" | "below" | "pos" | null>(null)

    const handleRuleAboveSelect = (rule: Rule, index: number) => {
        setActiveDialog(null)
        onAddAboveButtonClick(rule, index)
    }
    const handleRuleBelowSelect = (rule: Rule) => {
        setActiveDialog(null)
        onAddBelowButtonClick(node, rule)
    }

    return (
        <div
            className={`custom-node${hovered ? ' hovered' : ''}`}
            onMouseLeave={() => {setHovered(false); setHoveredNode(null)}}
            onMouseEnter={() => {setHovered(true); setHoveredNode(node)}}
        >
            <TableNodeBox
                node={node}
                mode={mode}
                isHovered={isHovered}
                onNodeClicked={onNodeClicked}
                onRowClicked={onRowClicked}
                onPopOutClicked={onPopOutClicked}
            />
            {(((hovered || focusClicked === node) && mode === "explore") || (mode === "query" && focusClicked === node))  && (
                <Tooltip title={node === focusClicked ? "Reset focus!" : "Focus on this node!"} placement="right" enterDelay={500}>
                    <button
                        type="button"
                        className="custom-node-btn-corner-base custom-node-btn-corner-explore"
                        style={{ top: -NORMAL_HEIGHT, left: node.width - 10, ...(greyedButtonStyle(node) as React.CSSProperties) }}
                        onClick={() => {
                            if (focusClicked === node) {
                                setFocusClicked(null)
                            }
                            else {
                                setFocusClicked(node)
                            }
                            onFocusButtonClick(node, node === focusClicked)
                        }}
                    >
                        <TbFocus2 />
                    </button>
                </Tooltip>
            )}
            {
                node.isRootNode && node.hasRulseAbove() && mode === "query" && (
                    <Tooltip title="Add a new rule above the root!" placement="right" enterDelay={500}>
                        <button
                            type="button"
                            className={`custom-node-btn-top add${node.isGreyed ? ' node-blur' : ''}`}
                            onClick={() => { 
                                const rulesAbove = node.getRulesAbove();
                                if (rulesAbove.length > 1) {
                                    setActiveDialog("above")
                                } else if (rulesAbove.length === 1) {
                                    const rule = rulesAbove[0];
                                    const body = rule.stringRepresentation.split(':-').map(s => s.trim())[1];
                                    const nodeName = node.getName();
                                    const possibleChildrenNames = getPredicateParts(body || "").map(p => p.split('(')[0].trim());
                                    
                                    const childrenWithSameName = possibleChildrenNames.filter(n => n === nodeName).length;
                                    if (childrenWithSameName === 1) {
                                        const pos = possibleChildrenNames.findIndex(n => n === nodeName);
                                        handleRuleAboveSelect(rule, pos);
                                    } else { //if there are multiple children with the same name, show position dialog
                                        setActiveDialog("pos");
                                    }
                                } else {
                                    handleRuleAboveSelect(rulesAbove[0], 0)
                                }
                            }}
                            style={greyedButtonStyle(node) as React.CSSProperties}
                        >
                            {/*<FaCodeBranch />*/}
                            <FaCodeFork style={{ transform: "rotate(180deg)" }} />
                        </button>
                    </Tooltip>
                )
            }

            {
                node.isLeafNode && node.hasRulsesBelow() && mode === "query" && (
                    <Tooltip title="Add a new rule below this leaf!" placement="right" enterDelay={500}>
                        <button
                            type="button"
                            className={`custom-node-btn-bottom add${node.isGreyed ? ' node-blur' : ''}`}
                            onClick={() => setActiveDialog("below")}
                            style={greyedButtonStyle(node) as React.CSSProperties}
                        >
                            <FaCodePullRequest style={{ transform: "scaleY(-1)" }} />
                        </button>
                    </Tooltip>
                )
            }

            {
                hovered && !node.isRootNode && mode === "query" && (
                    <Tooltip title="Make this node the new root node!" placement="right" enterDelay={500}>
                        <button
                            type="button"
                            className="custom-node-btn-top"
                            onClick={() => onRemoveButtonClick(node)}
                            onMouseEnter={() => giveRemoveAbovePreview(node)}
                            onMouseLeave={onMouseLeftButton}
                            style={greyedButtonStyle(node) as React.CSSProperties}
                        >
                            <FaCodeFork style={{ transform: "rotate(180deg)" }} />
                        </button>
                    </Tooltip>
                )
            }

            {
                !node.isLeafNode && (hovered || node.isCollapsed) && mode === "explore" && (
                    <Tooltip title={node.isCollapsed ? "Show the subtree!" : "Hide the subtree!"} placement="right" enterDelay={500}>
                        <button
                            type="button"
                            className="custom-node-btn-bottom"
                            onClick={() => {
                                onCollapseButtonClick(node, !node.isCollapsed)
                                setHovered(false)
                            }}
                            style={greyedButtonStyle(node) as React.CSSProperties}
                        >
                            {node.isCollapsed ? <IoIosArrowDown /> : <IoIosArrowUp />}
                        </button>
                    </Tooltip>
                )
            }

            {/*hovered && mode === "explore" && (
                <Tooltip title={"Highlight in Code!"} placement="right" enterDelay={500}>
                    <button
                        type="button"
                        className="custom-node-btn-side-left"
                        style={{ right: node.width, ...(greyedButtonStyle(node) as React.CSSProperties) }}
                        onClick={() => codingButtonClicked(node)}
                    >
                        <FaLaptopCode />
                    </button>
                </Tooltip>
            )*/}

            {/* RulesAbove */}
            <AddRuleDialog 
                title={"Choose Rule to Add Above: "} 
                open={activeDialog === "above"} 
                onClose={() => setActiveDialog(null)} 
                rules={node.getRulesAbove()} 
                onRuleSelect={handleRuleAboveSelect} 
                node={node} 
                showPositionDialog={true}
            />

            {/* Only Position Dialog*/}
            <PositionDialog
                open={activeDialog === "pos"} 
                onClose={() => setActiveDialog(null)} 
                node={node} 
                rule={node.getRulesAbove()[0]} 
                onPosSelect={handleRuleAboveSelect} 
            />

            {/* RulesBelow */}
            <AddRuleDialog 
                title={"Choose Rule to Add Below: "} 
                open={activeDialog === "below"} 
                onClose={() => setActiveDialog(null)} 
                rules={node.getRulesBelow()} 
                onRuleSelect={handleRuleBelowSelect} 
                node={node}
            />


        </div >
    )
}
