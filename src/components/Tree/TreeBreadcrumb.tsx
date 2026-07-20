import { useState } from 'react'
import { Tooltip } from '@mui/material'
import { FaChevronRight } from 'react-icons/fa'
import { TableNodeData, type TreeNodeData } from '../../data/TreeNodeData'
import ColoredLogicText from '../ColoredLogicText'
import { formatNodeLabel } from './treeNodeLabel'

const BREADCRUMB_LABEL_MAX_LENGTH = 28

function findPathToNode(root: TreeNodeData, target: TreeNodeData | null): TreeNodeData[] {
  if (!target) {
    return [root]
  }

  const path: TreeNodeData[] = []

  function visit(node: TreeNodeData): boolean {
    path.push(node)

    if (node === target) {
      return true
    }

    for (const child of node.getChildren()) {
      if (visit(child)) {
        return true
      }
    }

    path.pop()
    return false
  }

  return visit(root) ? path : [root]
}

function shortenBreadcrumbLabel(label: string) {
  return label.length > BREADCRUMB_LABEL_MAX_LENGTH
    ? `${label.slice(0, BREADCRUMB_LABEL_MAX_LENGTH - 1)}…`
    : label
}

type TreeBreadcrumbProps = {
  rootNode: TreeNodeData
  currentNode: TreeNodeData | null
  showFullLabels: boolean
  onNodeClick: (node: TreeNodeData) => void
  onNodeHover: (node: TreeNodeData | null) => void
}

export default function TreeBreadcrumb({
  rootNode,
  currentNode,
  showFullLabels,
  onNodeClick,
  onNodeHover,
}: Readonly<TreeBreadcrumbProps>) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const breadcrumbPath = findPathToNode(rootNode, currentNode)

  return (
    <div className="tree-breadcrumb" aria-label="Path from root to current node">
      {breadcrumbPath.map((pathNode, idx) => {
        const fullLabel = formatNodeLabel(pathNode)
        const displayedLabel = showFullLabels ? fullLabel : shortenBreadcrumbLabel(fullLabel)

        return (
          <span
            key={`${idx}-${pathNode.id.join('-')}`}
            className={[
              'tree-breadcrumb__item',
              pathNode instanceof TableNodeData
                ? 'tree-breadcrumb__item--predicate'
                : 'tree-breadcrumb__item--rule',
              hoveredIndex !== null && idx > hoveredIndex ? 'tree-breadcrumb__item--dimmed' : '',
            ].filter(Boolean).join(' ')}
          >
            {idx > 0 && (
              <span className="tree-breadcrumb__separator" aria-hidden="true">
                <FaChevronRight />
              </span>
            )}
            <Tooltip title={fullLabel} placement="top" enterDelay={400}>
              <button
                type="button"
                className={`tree-breadcrumb__button${showFullLabels ? ' tree-breadcrumb__button--full' : ''}`}
                onClick={() => onNodeClick(pathNode)}
                onMouseEnter={() => {
                  setHoveredIndex(idx)
                  onNodeHover(pathNode)
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null)
                  onNodeHover(null)
                }}
              >
                <ColoredLogicText text={displayedLabel} />
              </button>
            </Tooltip>
          </span>
        )
      })}
    </div>
  )
}
