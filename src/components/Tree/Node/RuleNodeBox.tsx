import Tooltip from '@mui/material/Tooltip'
import '../../../assets/NodeBox.css'
import type { RuleNodeData } from '../../../data/TreeNodeData'
import StringFormatter from '../../../util/StringFormatter'
import ColoredLogicText from '../../ColoredLogicText'

type NodeBoxProps = {
  node: RuleNodeData
  onMouseEnter?: () => void
  onClick?: () => void
}

export function RuleNodeBox({ node, onMouseEnter, onClick }: Readonly<NodeBoxProps>) {
  const ruleName = node.getName();
  const needsTooltip = StringFormatter.needsRuleTruncation(ruleName);
  const formattedRuleName = StringFormatter.breakRuleName(
    StringFormatter.formatRuleName(ruleName, true)
  );

  const content = (
    <div
      className={`rule-node-box${node.isGreyed ? ' node-grey' : ''}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      title={"Click to Highlight this Rule in the code! (in Nemo Web)"}
      style={{
        width: node.width,
        height: node.height,
        minWidth: 60,
        minHeight: 33,
      }}
    >
      <ColoredLogicText text={formattedRuleName} />
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
