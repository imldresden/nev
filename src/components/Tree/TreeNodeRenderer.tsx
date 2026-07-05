import { RuleNodeData, TableNodeData, TreeNodeData } from "../../data/TreeNodeData";
import type { PositionedTableNodeData } from "../../data/TreeNodeData";
import type { ExecutionTimeRange, Rule, TableEntryResponse } from "../../types/types";
import RuleNode from "./Node/RuleNode";
import TableNode from "./Node/TableNode";

type TreeNodeRendererProps = {
  node: PositionedTableNodeData;
  mode: "explore" | "query";
  showNodeExecutionTimes: boolean;
  executionTimeRange: ExecutionTimeRange;
  isSingleRuleTree: boolean;
  focusClicked: TreeNodeData | null;
  setFocusClicked: (node: TreeNodeData | null) => void;
  onAddAboveButtonClick: (ruleId: Rule, index: number) => void;
  onAddBelowButtonClick: (node: TableNodeData, ruleId: Rule) => void;
  onRemoveAboveButtonClick: (node: TreeNodeData) => void;
  onRemoveBelowButtonClick: (node: TreeNodeData) => void;
  onCollapseButtonClick: (node: TreeNodeData, bool: boolean) => void;
  onNodeClicked: (node: TreeNodeData) => void;
  onMouseLeftButton: () => void;
  giveFocusPreview: (node: TreeNodeData) => void;
  giveRemoveAbovePreview: (node: TreeNodeData) => void;
  giveRemoveBelowPreview: (node: TreeNodeData) => void;
  onFocusButtonClick: (node: TreeNodeData) => void;
  onFocusNode: (node: TreeNodeData, bool?: boolean) => void;
  onRowClicked: (row: TableEntryResponse, predicate: string) => void;
  hoveredNode?: TreeNodeData | null; 
  setHoveredNode: (node: TreeNodeData | null) => void;
  onPopOutClicked: (node: TableNodeData) => void;
  codingButtonClicked: (node:TreeNodeData) => void;
  isSelected: boolean;
};

export default function TreeNodeRenderer({
  node,
  mode,
  showNodeExecutionTimes,
  executionTimeRange,
  isSingleRuleTree,
  focusClicked,
  setFocusClicked,
  onRowClicked,
  codingButtonClicked,
  onAddAboveButtonClick,
  onAddBelowButtonClick,
  onRemoveAboveButtonClick,
  onRemoveBelowButtonClick,
  onCollapseButtonClick,
  onMouseLeftButton,
  giveFocusPreview,
  giveRemoveAbovePreview,
  giveRemoveBelowPreview,
  onNodeClicked,
  onFocusButtonClick,
  onFocusNode,
  hoveredNode,
  setHoveredNode,
  onPopOutClicked,
  isSelected
}: Readonly<TreeNodeRendererProps>) {

  const renderedWidth = Math.max(node.data.width, 60);
  const renderedHeight = Math.max(node.data.height, 33);

  if (node.data instanceof TableNodeData) {
    return (
      <foreignObject
        x={node.x - renderedWidth / 2}
        y={node.y}
        width={renderedWidth}
        height={renderedHeight}
        style={{ overflow: 'visible' }}
      >
        <TableNode
            node={node.data}
            mode={mode}
            showExecutionTime={showNodeExecutionTimes}
            executionTimeRange={executionTimeRange}
            setFocusClicked={setFocusClicked}
            focusClicked={focusClicked}
            onRowClicked={onRowClicked}
            codingButtonClicked={codingButtonClicked}
            onRemoveAboveButtonClick={onRemoveAboveButtonClick}
            onRemoveBelowButtonClick={onRemoveBelowButtonClick}
            giveRemoveAbovePreview= {giveRemoveAbovePreview}
            giveRemoveBelowPreview= {giveRemoveBelowPreview}
            onMouseLeftButton={onMouseLeftButton}
            onNodeClicked={onNodeClicked}
            onAddAboveButtonClick={onAddAboveButtonClick}
            onAddBelowButtonClick={onAddBelowButtonClick}
            onCollapseButtonClick={onCollapseButtonClick}
            onFocusButtonClick={onFocusNode}
            isHovered={hoveredNode === node.data} 
            setHoveredNode={setHoveredNode}
            onPopOutClicked={onPopOutClicked}
            isSelected={isSelected}
          />
      </foreignObject>
    )
  }
  if (node.data instanceof RuleNodeData) {
    return (
      <foreignObject
        x={node.x - renderedWidth / 2}
        y={node.y}
        width={renderedWidth}
        height={renderedHeight}
        style={{ overflow: 'visible' }}
      >
        <RuleNode
            node={node.data}
            mode={mode}
            isSingleRuleTree={isSingleRuleTree}
            onMouseLeftButton={onMouseLeftButton}
            giveFocusPreview={giveFocusPreview}
            focusClicked={focusClicked}
            codingButtonClicked={codingButtonClicked}
            setFocusClicked={setFocusClicked}
            onCollapseButtonClick={onCollapseButtonClick}
            onFocusButtonClick={onFocusButtonClick}
            onFocusNode={onFocusNode}
            isHovered={hoveredNode === node.data}
            setHoveredNode={setHoveredNode}
            isSelected={isSelected}
          />
      </foreignObject>
    )
  }
  return null
}
