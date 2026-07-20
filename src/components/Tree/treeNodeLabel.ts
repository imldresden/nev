import { TableNodeData, type TreeNodeData } from '../../data/TreeNodeData'
import StringFormatter from '../../util/StringFormatter'

export function formatNodeLabel(node: TreeNodeData) {
  if (node instanceof TableNodeData) {
    return StringFormatter.formatPredicate(node.getName(), false, node.parameterPredicate)
  }

  return StringFormatter.formatRuleName(node.getName(), false)
}
