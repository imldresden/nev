import type { RuleNodeData, TreeNodeData } from '../../../data/TreeNodeData'
import { useState } from 'react'
import { RuleNodeBox } from './RuleNodeBox'
import { Tooltip } from '@mui/material'
import { TbFocus2 } from 'react-icons/tb'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { greyedButtonStyle } from '../../../types/constants'
import { type Timeouts } from '../../../types/types'

type NodeProps = {
  node: RuleNodeData;
  focusClicked: TreeNodeData | null;
  setFocusClicked: (node: TreeNodeData | null) => void;
  mode: 'explore' | 'query';
  isSingleRuleTree: boolean;
  onFocusButtonClick: (node: RuleNodeData) => void;
  onFocusNode: (node: RuleNodeData, bool?: boolean) => void;
  onCollapseButtonClick: (node: TreeNodeData, bool: boolean) => void;
  isHovered?: boolean;
  onMouseLeftButton: () => void;
  giveFocusPreview: (node: TreeNodeData) => void;
  codingButtonClicked: (node: RuleNodeData) => void;
  setHoveredNode: (node: TreeNodeData | null) => void;
  isSelected: boolean;
}

export default function RuleNode({
  node,
  mode,
  isSingleRuleTree,
  focusClicked,
  setFocusClicked,
  onMouseLeftButton,
  codingButtonClicked,
  giveFocusPreview,
  onCollapseButtonClick,
  onFocusButtonClick,
  onFocusNode,
  isHovered,
  setHoveredNode,
  isSelected
}: Readonly<NodeProps>) {
  const [hovered, setHovered] = useState(false);
  const [hoverMap] = useState<Timeouts>({});

  return (
    <div
      className={`custom-node${isHovered ? ' hovered' : ''}${isSelected ? ' selected-for-export' : ''}`}
      onMouseLeave={() => {
            const id = node.id.join('');
            hoverMap[id] = setTimeout(() => {
                setHovered(false); 
                setHoveredNode(null)
            }, 1500) 
        }}
        
      style={{
        background: isHovered ? '#eaf6fb' : undefined
      }}
    >
      <RuleNodeBox
        node={node}
        onMouseEnter={() => {
            const id = node.id.join('');
            clearTimeout(hoverMap[id]);
            setHovered(true); 
            setHoveredNode(node);
        }}
        onClick={() => codingButtonClicked(node)}
      />
      {hovered && mode === "query" && !isSingleRuleTree && (
        <Tooltip title="Focus on this rule!" placement="right" enterDelay={500}>
          <button
            type="button"
            className="custom-node-btn-corner-base custom-node-btn-corner"
            style={{ top: -node.height, left: node.width - 10, ...(greyedButtonStyle(node) as React.CSSProperties) }}
            onClick={() => {onFocusButtonClick(node);codingButtonClicked(node)}}
            onMouseEnter={() => giveFocusPreview(node)}
            onMouseLeave={onMouseLeftButton}
          >
            <TbFocus2 />
          </button>
        </Tooltip>
      )}

      {
        (((hovered || focusClicked === node) && mode === "explore") || (mode === "query" && focusClicked === node)) && !isSingleRuleTree && (
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
                  codingButtonClicked(node)
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
              className="custom-node-btn-bottom collapse"
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
