import Tooltip from '@mui/material/Tooltip'
import '../../../assets/NodeBox.css'
import type { RuleNodeData } from '../../../data/TreeNodeData'
import StringFormatter from '../../../util/StringFormatter'

type NodeBoxProps = {
  node: RuleNodeData
  onMouseEnter?: () => void
}

export function RuleNodeBox({ node, onMouseEnter }: Readonly<NodeBoxProps>) {
  const ruleName = node.getName();
  const needsTooltip = StringFormatter.needsRuleTruncation(ruleName);

  const content = (
    <div
      className={`rule-node-box${node.isGreyed ? ' node-grey' : ''}`}
      onMouseEnter={onMouseEnter}
      style={{
        width: node.width,
        height: node.height,
        minWidth: 60,
        minHeight: 33,
      }}
    >
      {StringFormatter.formatRuleName(ruleName, true)}
    </div>
  );

  return needsTooltip ? (
    <Tooltip
      title={StringFormatter.formatRuleName(ruleName, false)}
      placement="top"
      enterDelay={400}
    >
      {content}
    </Tooltip>
  ) : content
};