import { useState, useRef, useEffect } from 'react'
import '../../../assets/NodeBox.css'
import '../../../assets/NodeDetails.css'
import type { TableNodeData, TreeNodeData } from '../../../data/TreeNodeData'
import { TiPin } from 'react-icons/ti'
import Tooltip from '@mui/material/Tooltip';
import { IconButton } from '@mui/material'
import StringFormatter from '../../../util/StringFormatter'
import { FaChevronLeft, FaChevronRight, FaMagnifyingGlass } from 'react-icons/fa6'
import { HIGHLIGHTING_COLORS } from '../../../types/constants'
import type { TableEntryResponse } from '../../../types/types'
import { measureTextWidth } from '../../../util/measureTextWidth'

type NodeBoxProps = {
  node: TableNodeData
  mode: 'explore' | 'query';
  onMouseEnter?: () => void
  onNodeClicked: (node: TreeNodeData) => void;
  clicked?: boolean
  onRowClicked: (row: TableEntryResponse, predicate: string) => void;
  onPopOutClicked: (node: TableNodeData) => void;
}

type TableNodeDetailsProps = {
  node: TableNodeData;
  mode: 'explore' | 'query';
  onRowClicked: (row: TableEntryResponse, predicate: string) => void;
  onPopOutClicked: (node: TableNodeData) => void;
};

function SingleEntryTable({ node }: { readonly node: TableNodeData }) {
  const name = node.getName();
  return (
    <div
      className="table-node-box__header"
      style={{ cursor: 'pointer' }}
    >
      <span>
        {StringFormatter.formatPredicate(name, true, node.getTableEntries()[0].termTuple)}
      </span>
    </div>
  );
}

function TableNodeHeader({
  node,
  onClick,
  onHeaderHover,
  onHeaderLeave,
}: {
  readonly node: TableNodeData;
  readonly onClick: () => void;
  readonly onHeaderHover: () => void;
  readonly onHeaderLeave: () => void;
}) {
  const name = node.getName();
  const needsTooltip = StringFormatter.needsTruncation(name);

  return (
    <Tooltip title={node.isExpanded ? "Hide details!" : "See more details!"} placement="right" enterDelay={500}>
      <div
        className="table-node-box__header"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
        onMouseEnter={onHeaderHover}
        onMouseLeave={onHeaderLeave}
      >
        {needsTooltip ? (
          <Tooltip
            title={StringFormatter.formatPredicate(name, false, node.parameterPredicate)}
            placement="top"
            enterDelay={800}
          >
            <span>
              {StringFormatter.formatPredicate(name, true, node.parameterPredicate)}
            </span>
          </Tooltip>
        ) : (
          <span>
            {StringFormatter.formatPredicate(name, true, node.parameterPredicate)}
          </span>
        )}
      </div>
    </Tooltip>
  );
}

function TableNodeDetails({ node, mode, onRowClicked, onPopOutClicked }: Readonly<TableNodeDetailsProps>) {
  // const [activeTab, setActiveTab] = useState<"table" | "details">("table");
  const scrollDivRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const pageSize = 50;

  const entries = node.getTableEntries();
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const pagedEntries = entries.slice((page - 1) * pageSize, page * pageSize);

  const columns = entries[0]
    ? [
      ...entries[0].termTuple.map((_, idx) => ({
        field: `col${idx}`,
        headerName: node.parameterPredicate[idx] === undefined ? `var${idx}` : `${node.parameterPredicate[idx]}`,
        width: 150
      })),
      ...(mode === "query"
        ? [{
          field: "action",
          headerName: "",
          width: 60,
          sortable: false,
          filterable: false,
          renderCell: (row: TableEntryResponse) => (
            <Tooltip title="Query for this fact!" placement="right" enterDelay={500}>
              <IconButton
                onClick={() => {
                  onRowClicked(row, node.getName())
                }}
                size="small">
                <FaMagnifyingGlass />
              </IconButton>
            </Tooltip>
          ),
        }]
        : [])
    ]
    : [];

  useEffect(() => {
    const div = scrollDivRef.current;
    if (!div) return;
    const handler = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      div.scrollTop += e.deltaY;
      return false;
    };
    div.addEventListener("wheel", handler, { passive: false });
    return () => div.removeEventListener("wheel", handler);
  }, [/*activeTab*/]);

  useEffect(() => {
    setPage(1);
  }, [entries.length]);

  return (
    <div className="table-node-details">
      {/*
      <ButtonGroup
        variant="contained"
        size="small"
        fullWidth
        sx={{ borderRadius: 0 }}
      >
        <Button
          color={activeTab === "table" ? "primary" : "inherit"}
          onClick={() => setActiveTab("table")}
          sx={{ fontWeight: "bold", borderRadius: 0 }}
        >
          Table
        </Button>
        <Button
          color={activeTab === "details" ? "primary" : "inherit"}
          onClick={() => setActiveTab("details")}
          sx={{ fontWeight: "bold", borderRadius: 0, pointerEvents: "none" }}
        >
          Details
        </Button>
      </ButtonGroup>
      */}
      <div className="table-node-details-content">
      {/* {activeTab === "table" && ( */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div
              ref={scrollDivRef}
              style={{
                flex: 1,
                minHeight: 120,
                maxHeight: 120,
                overflowY: "auto",
              }}
            >
              <table style={{ fontSize: "0.92em" }}>
                <thead>
                  <tr>
                    {columns.map((col, colIdx) => (
                      <th
                        key={colIdx}
                        style={col.field === "action" ? { width: 40, minWidth: 40, maxWidth: 40, textAlign: "center" } : undefined}
                      >
                        {col.headerName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedEntries.map((row, idx) => {
                    const rowKey = row.termTuple.join?.('|') || idx;
                    return (
                      <tr
                        className="table-row"
                        key={rowKey}
                        style={{ height: "24px" }}
                      >
                        {columns.map((col, colIdx) => {
                          const cellKey = `${rowKey}-${col.field}`;
                          return (
                            'renderCell' in col && typeof col.renderCell === 'function'
                              ? <td
                                key={cellKey}
                                style={col.field === "action"
                                  ? { width: 40, minWidth: 40, maxWidth: 40, textAlign: "center", padding: "3px 8px" }
                                  : { padding: "3px 8px" }
                                }
                              >
                                {col.renderCell(row)}
                              </td>
                              : <td key={cellKey} style={{ padding: "3px 8px" }}>{row.termTuple[colIdx] ?? ""}</td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                marginTop: 4
              }}
            >
              <span style={{ color: "#555", fontSize: "0.95em", padding: "4px 8px", justifySelf: "start" }}>
                Facts loaded: {entries.length}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifySelf: "center" }}>
                <Tooltip title="Previous page" placement="bottom" enterDelay={400}>
                  <IconButton
                    size="small"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{ borderRadius: 4, padding: 2 }}
                  >
                    <FaChevronLeft />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next page" placement="bottom" enterDelay={400}>
                  <IconButton
                    size="small"
                    disabled={page === pageCount}
                    onClick={() => setPage(page + 1)}
                    style={{ borderRadius: 4, padding: 2 }}
                  >
                    <FaChevronRight />
                  </IconButton>
                </Tooltip>
              </div>
              <div style={{ justifySelf: "end" }}>
                <Tooltip title="Open full table in new window!" placement="right" enterDelay={500}>
                  <IconButton
                    size="small"
                    onClick={() => onPopOutClicked(node)}
                    style={{
                      borderRadius: 4,
                      padding: 2,
                    }}>
                    <TiPin />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>
        {/* 
        )}
        {activeTab === "details" && (
          <div>
            {"test"}
          </div>
        )}
        */}
      </div>
    </div>
  );
}

export function TableNodeBox({ node, mode, onMouseEnter, clicked, onNodeClicked, onRowClicked, onPopOutClicked }: Readonly<NodeBoxProps>) {
  const [headerHovered, setHeaderHovered] = useState(false)

  const outlineColor = HIGHLIGHTING_COLORS[node.isHighlighted] || undefined;

  return (
    <div
      className={
        `table-node-box${clicked ? ' table-node-box--clicked' : ''}${node.isExpanded ? ' table-node-box--expanded' : ''}${headerHovered ? ' table-node-box--header-hovered' : ''}${node.isGreyed ? ' node-grey' : ''}`
      }
      onMouseEnter={onMouseEnter}
      style={{
        width: node.width,
        height: node.height,
        minWidth: 60,
        minHeight: 33,
        background: node.gotSearched ? "#fff7b2" : undefined,
        outline: outlineColor ? `3px solid ${outlineColor}` : undefined,
        outlineOffset: outlineColor ? 2 : undefined,
        zIndex: outlineColor ? 10 : undefined,
      }}
    >
      {node.isSingleEntryTable() 
        ? (
          <SingleEntryTable node={node} />
        )
        : (
          <>
            <TableNodeHeader
              node={node}
              onClick={() => {
                node.isExpanded = !node.isExpanded;
                onNodeClicked(node);
              }}
              onHeaderHover={() => setHeaderHovered(true)}
              onHeaderLeave={() => setHeaderHovered(false)}
            />

            {node.isExpanded && (
              <TableNodeDetails node={node} mode={mode} onRowClicked={onRowClicked} onPopOutClicked={onPopOutClicked} />
            )}
          </>
        )
      }
    </div>
  )
}
