import { Tooltip } from '@mui/material'
import { useState } from 'react'
import { TableNodeData, type TreeNodeData } from '../../data/TreeNodeData'
import StringFormatter from '../../util/StringFormatter'
import ColoredLogicText from '../ColoredLogicText'

type FlatRow = {
  node: TreeNodeData
  level: number
  isLast: boolean
  branches: boolean[]
}

function flattenTree(
  node: TreeNodeData,
  level = 0,
  isLast = true,
  branches: boolean[] = [],
  result: FlatRow[] = []
) {
  result.push({ node, level, isLast, branches: [...branches] });

  if (node.isCollapsed) {
    return result;
  }
  const children = node.getChildren()
  children.forEach((child, idx) => {
    flattenTree(
      child,
      level + 1,
      idx === children.length - 1,
      [...branches, idx !== children.length - 1],
      result
    )
  })
  return result
}

type IndentedTreeProps = {
  node: TreeNodeData
  onNodeClick: (node: TreeNodeData, bool: boolean) => void
  hoveredNode: TreeNodeData | null
  setHoveredNode: (node: TreeNodeData | null) => void
}

export default function IndentedTree({ node, onNodeClick, hoveredNode, setHoveredNode }: IndentedTreeProps) {
  const rows = flattenTree(node)
  const rowNumberWidth = `${String(rows.length).length + 1}ch`

  return (
    <div style={{ fontSize: 15, lineHeight: 1.2, width: "max-content", minWidth: "100%", boxSizing: "border-box" }}>
      {rows.map((row, idx) => (
        <IndentedTreeRow
          key={idx}
          rowIndex={idx + 1}
          rowNumberWidth={rowNumberWidth}
          row={row}
          onNodeClicked={onNodeClick}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
        />
      ))}
      <div style={{ height: 18, userSelect: "none" }} />
    </div>
  )
}

function IndentedTreeRow({
  rowIndex,
  rowNumberWidth,
  row,
  onNodeClicked,
  hoveredNode,
  setHoveredNode
}: Readonly<{
  rowIndex: number
  rowNumberWidth: string
  row: FlatRow
  onNodeClicked: (node: TreeNodeData, bool: boolean) => void
  hoveredNode: TreeNodeData | null
  setHoveredNode: (node: TreeNodeData | null) => void
}>) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  let color = '#217dbb'
  if (row.node instanceof TableNodeData) color = '#43a047'

  let caret = '';
  if (row.node.getChildren().length > 0) {
    caret = row.node.isCollapsed ? '>' : '';
  }

  let prefix = '';
  for (let i = 0; i < row.level - 1; i++) {
    prefix += '│';
  }
  if (row.level > 0) {
    prefix += '│';
  }

  let background: string;
  if (row.node.gotSearched) {
    background = '#fff7b2';
  } else if (hoveredNode === row.node) {
    background = '#eaf6fb'; //background = row.node instanceof TableNodeData ? '#d2f5e3' : '#c6e2fa';
  } else if (row.node.isCollapsed && row.node.getChildren().length > 0) {
    background = '#f0f0f0';
  } else {
    background = 'inherit';
  }

  const title = (row.node instanceof TableNodeData)
    ? StringFormatter.formatPredicate(row.node.getName(), false, row.node.parameterPredicate)
    : StringFormatter.formatRuleName(row.node.getName(), false)

  return (
    <div
      onMouseEnter={() => {
        setHoveredNode(row.node)
        setTooltipOpen(true)
      }}
      onMouseLeave={() => {
        setHoveredNode(null)
        setTooltipOpen(false)
      }}
      style={{
        cursor: 'pointer',
        background,
        color,
        whiteSpace: 'nowrap',
        width: 'max-content',
        minWidth: '100%',
      }}
      onClick={e => {
        if (e.ctrlKey) {onNodeClicked(row.node, true)}
        onNodeClicked(row.node, false);
      }}
    >
      <Tooltip
        title={title}
        placement="right"
        open={tooltipOpen}
        enterDelay={500}
        disableHoverListener
      >
        <span
          style={{
            position: 'sticky',
            right: 0,
            float: 'right',
            width: 1,
            height: '1.2em',
          }}
        />
      </Tooltip>
      <span style={{ display: 'inline-block' }}>
        <span
          style={{
            color: '#999',
            display: 'inline-block',
            width: rowNumberWidth,
            marginRight: '6px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {rowIndex}
        </span>
        {prefix}
        {(caret ? caret : ' ') + ' '}
        <ColoredLogicText text={title} />
      </span>
    </div>
  );
}
