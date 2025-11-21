import Drawer from '@mui/material/Drawer';
import { FaExpand } from "react-icons/fa";
import { Resizable } from "re-resizable";
import '../../assets/Overlay.css'
import IconButton from '@mui/material/IconButton';
import { DataGrid } from '@mui/x-data-grid';
import type { TableNodeData } from '../../data/TreeNodeData';
import { Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaArrowLeft, FaArrowRight, FaMagnifyingGlass } from 'react-icons/fa6';
import StringFormatter from '../../util/StringFormatter';
import { HIGHLIGHTING_COLORS } from '../../types/constants';
import type { TableEntryResponse, TableColumn, ColumnParams } from '../../types/types';
import PaginationBar from './Pagination';

type TableDialogPanelProps = {
    nodes: TableNodeData[];
    onMoveLeft: (node: TableNodeData) => void;
    onMoveRight: (node: TableNodeData) => void;
    mode: "explore" | "query";
    open: boolean;
    onClose: (node: TableNodeData) => void;
    onRowClicked: (row: TableEntryResponse, predicate: string) => void;
    onLoadMoreClicked: (node: TableNodeData, pagination: { start: number, count: number }) => void;
    version: number;
    onMaximizeTable: (node: TableNodeData) => void;
};

export default function TableDialogPanel({
    nodes,
    onMoveLeft,
    onMoveRight,
    open,
    mode,
    onClose,
    onRowClicked,
    onLoadMoreClicked,
    version,
    onMaximizeTable
}: Readonly<TableDialogPanelProps>) {
    const [panelHeight, setPanelHeight] = useState(450);
    
    if (!nodes || nodes.length === 0) return null;
    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            sx={{
                width: '98%',
                margin: '0 auto',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                p: 2,
                zIndex: 5,
                overflowY: 'auto',
                transition: "height 0.2s"
            }}
            transitionDuration={300}
            variant="persistent"
        >
            <Resizable
                size={{ width: "100%", height: panelHeight }}
                minHeight={150}
                maxHeight={window.innerHeight - 100}
                enable={{ top: true }}
                onResize={(_e, _direction, ref) => {
                    setPanelHeight(ref.offsetHeight);
                }}
                handleStyles={{
                    top: {
                        height: "12px",
                        top: -16,
                        left: 0,
                        right: 0,
                        borderRadius: "8px 8px 0 0",
                        zIndex: 2001,
                        cursor: "ns-resize"
                    }
                }}
                style={{
                    width: "100%",
                    margin: "0 auto",
                    position: "relative",
                    transition: "height 0.2s"
                }}
            >
                <div
                    style={{
                        width: "100%",
                        margin: "0 auto",
                        display: "flex",
                        gap: 24,
                        alignItems: "flex-start",
                        overflowX: "auto"
                    }}
                >
                    {nodes.map((node: TableNodeData, idx: number) => {
                        const style: React.CSSProperties = { minWidth: 420, minHeight: 0 };
                        if (nodes.length === 1) {
                            style.flex = "1 1 100%";
                            style.maxWidth = "100%";
                        } else if (nodes.length === 2) {
                            style.flex = "1 1 50%";
                            style.maxWidth = "50%";
                        } else if (nodes.length === 3) {
                            style.flex = "1 1 33.3333%";
                            style.maxWidth = "33.3333%";
                        }
                        return (
                            <SingleTablePanel
                                key={node.getName() + idx}
                                node={node}
                                onMoveLeft={() => onMoveLeft(node)}
                                onMoveRight={() => onMoveRight(node)}
                                mode={mode}
                                onRowClicked={onRowClicked}
                                onLoadMoreClicked={onLoadMoreClicked}
                                version={version}
                                onClose={() => onClose(node)}
                                onMaximize={() => onMaximizeTable(node)}
                                style={style}
                            />
                        );
                    })}
                </div>
            </Resizable>
        </Drawer>
    );
}

function SingleTablePanel({
    node,
    onMoveLeft,
    onMoveRight,
    mode,
    onRowClicked,
    onLoadMoreClicked,
    version,
    onClose,
    onMaximize,
    style = {}
}: Readonly<{
    node: TableNodeData;
    onMoveLeft: (node: TableNodeData) => void;
    onMoveRight: (node: TableNodeData) => void;
    mode: "explore" | "query";
    onRowClicked: (row: TableEntryResponse, predicate: string) => void;
    onLoadMoreClicked: (node: TableNodeData, pagination: { start: number, count: number }) => void;
    version: number;
    onClose: () => void;
    onMaximize: () => void;
    style?: React.CSSProperties;
}>) {
    
    const [page] = useState(1);
    const [pageSize] = useState(50);
    const entries = useMemo(() => node.getTableEntries(), [node, version]);

    const pagedRows = entries.slice((page - 1) * pageSize, page * pageSize).map((row) => {
        const rowObj: { id: string; [key: string]: string } = { id: `${row.entryId}` };
        row.termTuple.forEach((val, colIdx) => {
            rowObj[`col${colIdx}`] = val;
        });
        return rowObj;
    });

    let columns: TableColumn[] = [];
    if (entries[0]) {
        if (mode === "query") {
            columns = [
                ...entries[0].termTuple.map((_, idx) => ({
                    field: `col${idx}`,
                    headerName: node.parameterPredicate[idx] === undefined ? `var${idx}` : `${node.parameterPredicate[idx]}`,
                    width: 150,
                })),
                {
                    field: "action",
                    headerName: "",
                    width: 60,
                    sortable: false,
                    filterable: false,
                    renderCell: (params: ColumnParams) => (
                        <Tooltip title="Query for this fact!" placement="right" enterDelay={500}>
                            <IconButton
                                onClick={() => {
                                    const row: TableEntryResponse = {
                                        entryId: +params.row.id,
                                        termTuple: Object.values(params.row).filter((_d, i) => i > 0).map(d => `${d}`)
                                    }
                                    onRowClicked(row, node.getName());
                                    node.isHighlighted = 0;
                                    onClose();
                                }}
                            >
                                <FaMagnifyingGlass />
                            </IconButton>
                        </Tooltip>
                    ),
                }
            ];
        } else {
            columns = entries[0].termTuple.map((_, idx) => ({
                field: `col${idx}`,
                headerName: node.parameterPredicate[idx] === undefined ? `var${idx}` : `${node.parameterPredicate[idx]}`,
                width: 150,
            }));
        }
    }

    const outlineColor = HIGHLIGHTING_COLORS[node.isHighlighted] || undefined;

    return (
        <div
            style={{
                minWidth: 420,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                padding: 8,
                margin: "8px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                outline: outlineColor ? `3px solid ${outlineColor}` : undefined,
                outlineOffset: outlineColor ? 2 : undefined,
                zIndex: outlineColor ? 10 : undefined,
                ...style
            }}
        >
            <div style={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                gap: 4,
                zIndex: 2
            }}>
                <Tooltip title="Move left" placement="top" enterDelay={500}>
                    <IconButton aria-label="move-left" onClick={() => onMoveLeft(node)} size="small">
                        <FaArrowLeft />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Move right" placement="top" enterDelay={500}>
                    <IconButton aria-label="move-right" onClick={() => onMoveRight(node)} size="small">
                        <FaArrowRight />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Enter fullscreen mode!" placement="top" enterDelay={500}>
                    <IconButton aria-label="fullscreen" onClick={onMaximize} size="small">
                        <FaExpand />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Close this table!" placement="top" enterDelay={500}>
                    <IconButton aria-label="close" onClick={onClose} size="small">
                        <IoMdClose />
                    </IconButton>
                </Tooltip>
            </div>
            <Tooltip
                title={StringFormatter.formatPredicate(node.getName(), false, node.parameterPredicate)}
                placement="top"
                enterDelay={400}
            >
                <span
                    style={{
                        fontSize: 18,
                        paddingRight: 60,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                        maxWidth: "calc(100% - 130px)",
                        cursor: "pointer",
                        marginBottom: 12
                    }}
                >
                    Table: {StringFormatter.formatPredicate(node.getName(), false, node.parameterPredicate)}
                    {node.isOutdated && <span style={{ color: "#d32f2f", marginLeft: 8 }}>(outdated)</span>}
                </span>
            </Tooltip>
            <div style={{ flex: "1 1 auto", maxHeight: 320, overflowY: "auto", marginBottom: 0 }}>
                <DataGrid
                    rows={pagedRows}
                    columns={columns}
                    pageSizeOptions={[pageSize]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-row.Mui-selected': {
                            backgroundColor: 'inherit',
                        },
                        '& .MuiDataGrid-cell.Mui-selected': {
                            backgroundColor: 'inherit',
                        },
                    }}
                    density="compact"
                    autoHeight={false}
                    hideFooterPagination={true}
                />
            </div>
            <PaginationBar node={node} load={onLoadMoreClicked}/>
        </div>
    )
}
