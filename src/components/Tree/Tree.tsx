import { useMemo, useRef, useEffect, useState, type ReactNode } from 'react'
import * as d3 from 'd3'
import { RuleNodeData, TableNodeData, type TreeNodeData } from '../../data/TreeNodeData'
import type { PositionedTableNodeData } from "../../data/TreeNodeData";
import CustomLink from './CustomLink'
import TreeNodeRenderer from './TreeNodeRenderer'
import { flextree, type FlextreeNode } from 'd3-flextree'
import { TOP_PADDING } from '../../types/constants'
import type { Rule, TableEntryResponse } from '../../types/types'
import { StringFormatter } from '../../util/StringFormatter'

type PanToNode = { node: TreeNodeData, center?: boolean } | null;

type TreeProps = {
  data: TableNodeData;
  mode: "explore" | "query";
  showNodeExecutionTimes: boolean;
  treeVersion: number;
  panToNodeId?: PanToNode;
  setPanToNodeId?: (id: PanToNode) => void;
  width?: number;
  height?: number;
  focusClicked: TreeNodeData | null;
  setFocusClicked: (node: TreeNodeData | null) => void;
  onAddAboveButtonClick: (ruleId: Rule, index: number) => void;
  onAddBelowButtonClick: (node: TableNodeData, ruleId: Rule) => void;
  onRemoveAboveButtonClick: (node: TreeNodeData) => void;
  onRemoveBelowButtonClick: (node: TreeNodeData) => void;
  onCollapseButtonClick: (node: TreeNodeData, bool: boolean) => void;
  onNodeClicked: (node: TreeNodeData) => void;
  onMouseLeftButton: () => void;
  codingButtonClicked: (node: RuleNodeData) => void;
  giveFocusPreview: (node: TreeNodeData) => void;
  handleRemoveEdgePreview: (source: TreeNodeData) => void;
  giveRemoveAbovePreview: (node: TreeNodeData) => void;
  giveRemoveBelowPreview: (node: TreeNodeData) => void;
  onFocusButtonClick: (node: TreeNodeData) => void;
  onFocusNode: (node: TreeNodeData, bool?: boolean) => void;
  onRowClicked: (row: TableEntryResponse, predicate: string) => void;
  hoveredNode?: TreeNodeData | null;
  setHoveredNode: (node: TreeNodeData | null) => void;
  onPopOutClicked: (node: TableNodeData) => void;
  selectedNodes: TreeNodeData[];
  onSelectionChange: (nodes: TreeNodeData[]) => void;
};

export default function Tree({
  data,
  mode,
  showNodeExecutionTimes,
  width,
  height,
  panToNodeId,
  focusClicked,
  codingButtonClicked,
  setFocusClicked,
  onAddAboveButtonClick,
  onAddBelowButtonClick,
  onRemoveAboveButtonClick,
  onRemoveBelowButtonClick,
  onCollapseButtonClick,
  onNodeClicked,
  giveFocusPreview,
  onMouseLeftButton,
  giveRemoveAbovePreview,
  giveRemoveBelowPreview,
  onFocusButtonClick,
  onFocusNode,
  onRowClicked,
  treeVersion,
  hoveredNode,
  setHoveredNode,
  setPanToNodeId,
  onPopOutClicked,
  selectedNodes,
  onSelectionChange
}: Readonly<TreeProps>) {
  type FlextreeLink = {
    source: PositionedTableNodeData, target: PositionedTableNodeData
  };

  const { nodes, links, maxX, maxY } = useMemo(() => {
    function childrenFn(d: TableNodeData): TableNodeData[] | null {
      if (mode === "explore" && (d as TreeNodeData).isCollapsed) return null;
      return ((d.getChildren?.() ?? []) as TableNodeData[]).filter(() => true);
    }

    const layout = flextree({}).nodeSize((node: d3.HierarchyNode<unknown>) => [
      ((node.data as TableNodeData).width ?? 60) + 60,
      ((node.data as TableNodeData).height ?? 120) + 100
    ]);

    StringFormatter.getInstance().resetMaxLengthSlider(data);
    const root = layout.hierarchy(data, childrenFn as (d: unknown) => Iterable<TableNodeData> | null);
    layout(root);
    const nodes = root.descendants() as FlextreeNode<TableNodeData>[];
    const links = root.links() as FlextreeLink[];
    const maxX = Math.max(...nodes.map((n: { x: number }) => n.x ?? 0));
    const maxY = Math.max(...nodes.map((n: { y: number }) => n.y ?? 0));
    return { nodes, links, maxX, maxY };
  }, [data, width, height, treeVersion, mode]);

  const isSingleRuleTree = useMemo(() => {
    let ruleCount = 0;
    const stack: TreeNodeData[] = [data];
    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;
      if (current instanceof RuleNodeData) {
        ruleCount += 1;
        if (ruleCount > 1) return false;
      }
      const children = current.getChildren?.() ?? [];
      for (const child of children) stack.push(child);
    }
    return ruleCount <= 1;
  }, [data, treeVersion]);

  const executionTimeRange = (() => {
    const executionTimes: number[] = [];
    const stack: TreeNodeData[] = [data];

    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;

      if (current instanceof TableNodeData && Number.isFinite(current.executionTime)) {
        executionTimes.push(current.executionTime);
      }

      stack.push(...(current.getChildren?.() ?? []));
    }

    if (executionTimes.length === 0) return null;

    const sortedScaledTimes = executionTimes
      .map(time => Math.log1p(time))
      .sort((a, b) => a - b);

    const quantile = (values: number[], q: number) => {
      if (values.length === 1) return values[0];

      const position = (values.length - 1) * q;
      const base = Math.floor(position);
      const rest = position - base;
      const nextValue = values[base + 1];

      if (nextValue === undefined) return values[base];

      return values[base] + rest * (nextValue - values[base]);
    };

    const scaledMin = sortedScaledTimes[0];
    const scaledMax = sortedScaledTimes[sortedScaledTimes.length - 1];
    const firstQuartile = quantile(sortedScaledTimes, 0.25);
    const thirdQuartile = quantile(sortedScaledTimes, 0.75);
    const interquartileRange = thirdQuartile - firstQuartile;
    const robustUpper = interquartileRange === 0
      ? scaledMax
      : Math.min(scaledMax, thirdQuartile + interquartileRange * 1.5);

    return {
      min: Math.min(...executionTimes),
      max: Math.max(...executionTimes),
      scaleMin: scaledMin,
      scaleMax: Math.max(scaledMin, robustUpper),
    };
  })();

  const padding = 100
  if (!width) width = 0;
  if (!height) height = 0;
  const svgWidth = Math.max(width, (maxY || 0) + padding)
  const svgHeight = Math.max(height, (maxX || 0) + padding)

  // Zoom/Pan
  const svgRef = useRef<SVGSVGElement>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // init Transform-Status
  const centerX = width / 2;
  const initialOffsetX = centerX;
  const initialOffsetY = TOP_PADDING; 

  const [transform, setTransform] = useState(
    d3.zoomIdentity.translate(initialOffsetX, initialOffsetY)
  );

  const zoomBehavior = useMemo(() => d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.2, 3])
    .filter((event) => event.type !== "dblclick" && !event.ctrlKey && !event.metaKey)
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      setTransform(event.transform)
    }), []);

  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).call(zoomBehavior);
  }, [zoomBehavior]);

  const navigateFromMinimap = (worldX: number, worldY: number) => {
    if (!svgRef.current) return;
    const nextTransform = d3.zoomIdentity
      .translate(width / 2 - worldX * transform.k, height / 2 - worldY * transform.k)
      .scale(transform.k);
    d3.select(svgRef.current).call(zoomBehavior.transform, nextTransform);
  };

  const pointerPosition = (event: React.PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const handleSelectionStart = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 || (!event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = pointerPosition(event);
    dragStartRef.current = start;
    setSelectionBox({ ...start, width: 0, height: 0 });
  };

  const handleSelectionMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const current = pointerPosition(event);
    setSelectionBox({
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: Math.abs(current.x - start.x),
      height: Math.abs(current.y - start.y),
    });
  };

  const handleSelectionEnd = (event: React.PointerEvent<SVGSVGElement>) => {
    const box = selectionBox;
    dragStartRef.current = null;
    setSelectionBox(null);
    if (!box || (box.width < 3 && box.height < 3)) {
      onSelectionChange([]);
      return;
    }

    const selected = nodes
      .filter(node => {
        const [centerX, top] = transform.apply([node.x, node.y]);
        const nodeWidth = Math.max(node.data.width, 60) * transform.k;
        const nodeHeight = Math.max(node.data.height, 33) * transform.k;
        const left = centerX - nodeWidth / 2;
        return left < box.x + box.width && left + nodeWidth > box.x
          && top < box.y + box.height && top + nodeHeight > box.y;
      })
      .map(node => node.data);
    onSelectionChange(selected);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const [lastCenteredRootId, setLastCenteredRootId] = useState<number[] | null>(null);

useEffect(() => {
  if (!nodes.length || !width || !height || !svgRef.current) return;

  if (panToNodeId) {
  const { node, center } = panToNodeId;
  const targetNode = nodes.find((n: FlextreeNode<TableNodeData>) => n.data === node); // Direktes Objekt-Matching!
  if (!targetNode) return;

  const x = targetNode.x;
  const y = targetNode.y;
  const centerX = width / 2;

  let dx, dy;
  if (center) {
    const centerY = height / 2;
    dx = centerX - x;
    dy = centerY - y;
  } else {
    dx = centerX - x;
    dy = TOP_PADDING - y;
  }

  const newTransform = d3.zoomIdentity.translate(dx, dy);
  d3.select(svgRef.current)
    .transition()
    .duration(500)
    .call(zoomBehavior.transform, newTransform);

  setTransform(newTransform);

  if (setPanToNodeId) {
    setTimeout(() => setPanToNodeId(null), 600);
  }
  return;
}

  //for first redering
  const rootNode = nodes[0];
  if (lastCenteredRootId && JSON.stringify(rootNode.data.id) === JSON.stringify(lastCenteredRootId)) {
    return;
  }

  const centerX = width / 2;
  const initialOffsetX = centerX - (rootNode?.y ?? 0);
  const initialOffsetY = TOP_PADDING - (rootNode?.x ?? 0);
  const initialTransform = d3.zoomIdentity.translate(initialOffsetX, initialOffsetY);

  setTransform(initialTransform);

  d3.select(svgRef.current)
    .call(zoomBehavior.transform, initialTransform);

  setLastCenteredRootId(rootNode.data.id);

}, [nodes, width, height, panToNodeId, lastCenteredRootId, setPanToNodeId, zoomBehavior]);

  const renderTreeContent = (visualOnly = false) => (
    <>
      {links.map((link: FlextreeLink, i: number) => (
        <CustomLink
          key={`link-${i}`}
          source={link.source}
          target={link.target}
        />
      ))}

      {nodes.map((node: PositionedTableNodeData, i: number) => (
        <TreeNodeRenderer
          key={`node-${i}`}
          node={node}
          mode={mode}
          showNodeExecutionTimes={showNodeExecutionTimes}
          executionTimeRange={executionTimeRange}
          isSingleRuleTree={isSingleRuleTree}
          codingButtonClicked={codingButtonClicked}
          focusClicked={focusClicked}
          onMouseLeftButton={onMouseLeftButton}
          setFocusClicked={setFocusClicked}
          onRemoveAboveButtonClick={onRemoveAboveButtonClick}
          onRemoveBelowButtonClick={onRemoveBelowButtonClick}
          onAddAboveButtonClick={onAddAboveButtonClick}
          onAddBelowButtonClick={onAddBelowButtonClick}
          giveFocusPreview={giveFocusPreview}
          giveRemoveAbovePreview={giveRemoveAbovePreview}
          giveRemoveBelowPreview={giveRemoveBelowPreview}
          onCollapseButtonClick={onCollapseButtonClick}
          onNodeClicked={onNodeClicked}
          onFocusButtonClick={onFocusButtonClick}
          onFocusNode={onFocusNode}
          onRowClicked={onRowClicked}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          onPopOutClicked={onPopOutClicked}
          visualOnly={visualOnly}
          isSelected={!visualOnly && selectedNodes.includes(node.data)}
        />
      ))}
    </>
  );

  return (
    <div style={{ position: 'relative', width: svgWidth, height: svgHeight }}>
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}
        onPointerDown={handleSelectionStart}
        onPointerMove={handleSelectionMove}
        onPointerUp={handleSelectionEnd}
        onPointerCancel={handleSelectionEnd}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#555" />
          </marker>
        </defs>
        <g transform={transform.toString()}>
          {renderTreeContent()}
        </g>
        {selectionBox && (
          <rect
            {...selectionBox}
            fill="rgba(25, 118, 210, 0.12)"
            stroke="#1976d2"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            pointerEvents="none"
          />
        )}
      </svg>
      <TreeMinimap
        nodes={nodes}
        treeContent={renderTreeContent(true)}
        transform={transform}
        viewportWidth={width}
        viewportHeight={height}
        onNavigate={navigateFromMinimap}
      />
    </div>
  )
}

type TreeMinimapProps = {
  nodes: FlextreeNode<TableNodeData>[];
  treeContent: ReactNode;
  transform: d3.ZoomTransform;
  viewportWidth: number;
  viewportHeight: number;
  onNavigate: (worldX: number, worldY: number) => void;
};

function TreeMinimap({ nodes, treeContent, transform, viewportWidth, viewportHeight, onNavigate }: Readonly<TreeMinimapProps>) {
  const minimapWidth = 240;
  const minimapHeight = 150;
  const inset = 10;

  if (nodes.length === 0) return null;

  const minX = Math.min(...nodes.map(node => node.x - node.data.width / 2));
  const maxX = Math.max(...nodes.map(node => node.x + node.data.width / 2));
  const minY = Math.min(...nodes.map(node => node.y));
  const maxY = Math.max(...nodes.map(node => node.y + node.data.height));
  const contentWidth = Math.max(1, maxX - minX);
  const contentHeight = Math.max(1, maxY - minY);
  const scale = Math.min(
    (minimapWidth - inset * 2) / contentWidth,
    (minimapHeight - inset * 2) / contentHeight
  );
  const offsetX = (minimapWidth - contentWidth * scale) / 2 - minX * scale;
  const offsetY = (minimapHeight - contentHeight * scale) / 2 - minY * scale;

  const viewportX = (-transform.x / transform.k) * scale + offsetX;
  const viewportY = (-transform.y / transform.k) * scale + offsetY;
  const viewportRectWidth = viewportWidth / transform.k * scale;
  const viewportRectHeight = viewportHeight / transform.k * scale;

  const navigate = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    onNavigate((x - offsetX) / scale, (y - offsetY) / scale);
  };

  return (
    <div className="tree-minimap" aria-label="Trace minimap">
      <svg
        width={minimapWidth}
        height={minimapHeight}
        viewBox={`0 0 ${minimapWidth} ${minimapHeight}`}
        role="img"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          navigate(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) navigate(event);
        }}
      >
        <g
          transform={`translate(${offsetX} ${offsetY}) scale(${scale})`}
          className="tree-minimap__tree"
        >
          {treeContent}
        </g>
        <rect
          x={viewportX}
          y={viewportY}
          width={viewportRectWidth}
          height={viewportRectHeight}
          className="tree-minimap__viewport"
        />
      </svg>
    </div>
  );
}
