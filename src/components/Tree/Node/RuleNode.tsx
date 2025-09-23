import type { RuleNodeData, TreeNodeData } from '../../../data/TreeNodeData'
import { useState } from 'react'
import '../../../assets/Node.css'
import { RuleNodeBox } from './RuleNodeBox'
import { Tooltip } from '@mui/material'
import { TbFocus2 } from 'react-icons/tb'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { greyedButtonStyle } from '../../../types/constants'

type NodeProps = {
  node: RuleNodeData;
  focusClicked: TreeNodeData | null;
  setFocusClicked: (node: TreeNodeData | null) => void;
  mode: 'explore' | 'query';
  onFocusButtonClick: (node: RuleNodeData) => void;
  onFocusNode: (node: RuleNodeData, bool?: boolean) => void;
  onCollapseButtonClick: (node: TreeNodeData, bool: boolean) => void;
  isHovered?: boolean;
  onMouseLeftButton: () => void;
  giveFocusPreview: (node: TreeNodeData) => void;
  codingButtonClicked: (node: TreeNodeData) => void;
  setHoveredNode: (node: TreeNodeData | null) => void;
}

export default function RuleNode({
  node,
  mode,
  focusClicked,
  setFocusClicked,
  onMouseLeftButton,
  giveFocusPreview,
  onCollapseButtonClick,
  onFocusButtonClick,
  onFocusNode,
  isHovered,
  setHoveredNode
}: Readonly<NodeProps>) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`custom-node${isHovered ? ' hovered' : ''}`}
      onMouseLeave={() => {setHovered(false); setHoveredNode(null)}}
      style={{
        background: isHovered ? '#eaf6fb' : undefined
      }}
    >
      <RuleNodeBox
        node={node}
        onMouseEnter={() => {setHovered(true); setHoveredNode(node)}}
      />
      {hovered && mode === "query" && (
        <Tooltip title="Focus on this rule!" placement="right" enterDelay={500}>
          <button
            type="button"
            className="custom-node-btn-corner-base custom-node-btn-corner"
            style={{ top: -node.height, left: node.width - 10, ...(greyedButtonStyle(node) as React.CSSProperties) }}
            onClick={() => onFocusButtonClick(node)}
            onMouseEnter={() => giveFocusPreview(node)}
            onMouseLeave={onMouseLeftButton}
          >
            <TbFocus2 />
          </button>
        </Tooltip>
      )}

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

      {
        (((hovered || focusClicked === node) && mode === "explore") || (mode === "query" && focusClicked === node)) && (
          <Tooltip title={node === focusClicked ? "Reset focus!" : "Focus on this rule!"} placement="right" enterDelay={500}>
            <button
              type="button"
              className="custom-node-btn-corner-base custom-node-btn-corner-explore"
              style={{ top: -node.height, left: node.width - 10, ...(greyedButtonStyle(node) as React.CSSProperties) }}
              onClick={() => {
                if (focusClicked === node) {
                  setFocusClicked(null)
                }
                else {
                  setFocusClicked(node)
                }
                onFocusNode(node, node === focusClicked)
              }}
            >
              <TbFocus2 />
            </button>
          </Tooltip>
        )
      }
      {
        (node.isCollapsed || hovered) && mode === "explore" && (
          <Tooltip title="Collapse the subtree!" placement="right" enterDelay={500}>
            <button
              type="button"
              className="custom-node-btn-bottom"
              onClick={() => {
                onCollapseButtonClick(node, !node.isCollapsed)
                setHovered(false)
              }}
              style={ greyedButtonStyle(node) as React.CSSProperties }
            >
              {node.isCollapsed ? <IoIosArrowDown /> : <IoIosArrowUp />}
            </button>
          </Tooltip>
        )
      }
    </div >
  )
}
