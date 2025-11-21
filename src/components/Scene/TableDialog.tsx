import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { DataGrid } from '@mui/x-data-grid';
import type { TableNodeData } from '../../data/TreeNodeData';
import { Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';
import { FaCompress } from 'react-icons/fa';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import StringFormatter from '../../util/StringFormatter';
import type { TableEntryResponse, TableColumn, ColumnParams } from '../../types/types';
import PaginationBar from './Pagination';

type TableProps = {
    node: TableNodeData | null;
    mode: "explore" | "query";
    open: boolean;
    onClose: () => void;
    onRowClicked: (row: TableEntryResponse, predicate: string) => void;
    onLoadMoreClicked: (node: TableNodeData, pagination: { start: number, count: number }) => void;
    version: number;
    onTogglePanel: () => void;
};

function TableDialog({
    node,
    mode,
    open,
    onClose,
    onRowClicked,
    onLoadMoreClicked,
    version,
    onTogglePanel
}: Readonly<TableProps>) {
    const [page] = useState(1);
    const [pageSize] = useState(50);

    const entries = useMemo(() => node ? node.getTableEntries() : [], [node, version]);

    const pagedRows = entries.slice((page - 1) * pageSize, page * pageSize).map((row) => {
        const rowObj: { id: string;[key: string]: string } = { id: `${row.entryId}` };
        row.termTuple.forEach((val, colIdx) => {
            rowObj[`col${colIdx}`] = val;
        });
        return rowObj;
    });

    if (!node) return null;
    let columns: TableColumn[] = [];
    if (entries[0]) {
        if (mode === "query") {
            columns = [
                ...entries[0].termTuple.map((_, idx) => ({
                    field: `col${idx}`,
                    headerName: node.parameterPredicate[idx] === undefined ? `var${idx}` : `${node.parameterPredicate[idx]}`,
                    width: 150
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
                width: 150
            }));
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullScreen scroll="paper">
            <DialogTitle>
                Table: {StringFormatter.formatPredicate(node.getName(), false, node.parameterPredicate)}
                <Tooltip title="Leave fullscreen mode!" placement="left" enterDelay={500}>
                    <IconButton aria-label="panel" onClick={onTogglePanel} sx={{ position: "absolute", right: 8, top: 8 }}>
                        <FaCompress />
                    </IconButton>
                </Tooltip>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
                    <div style={{ flex: 1, overflowY: "auto" }}>
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
                    <PaginationBar node={node} load={onLoadMoreClicked} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default TableDialog;
