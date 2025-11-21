import { Tooltip, TextField, IconButton } from "@mui/material";
import { TableNodeData } from "../../data/TreeNodeData";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdFirstPage } from "react-icons/md";

type PaginationBarProps = {
  node: TableNodeData;
  load: (node: TableNodeData, pagination: { start: number, count: number }) => void
  showInfo?: boolean;
};

export default function PaginationBar({
  node,
  load,
  showInfo = true
}: PaginationBarProps) {

  const [start, setStart] = useState(node.getPagination().start);
  const [count, setCount] = useState(node.getPagination().count);
  const [page, setPage] = useState(0);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
      padding: "4px 0",
      minHeight: 0
    }}>
      {showInfo && (
        <span style={{ fontSize: 13, color: "#888", marginBottom: 0 }}>
          Showing facts {
            page * count + 1 
          } - {
            page * count + node.getTableEntries().length
          } {node.moreEntriesExist ? '(more exist)' : ''}
        </span>
      )}
      
      <Tooltip title="Back to start" placement="bottom" enterDelay={400}>
        <span>
          <IconButton
            size="medium"
            disabled={start === 0}
            onClick={() => {
              const newPage = 0;
              const newStart = newPage * count
              setPage(newPage);
              setStart(newStart);
              load(node, { start: newStart, count });
            }}
            style={{ borderRadius: 4, padding: 2 }}
          >
            <MdFirstPage />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Previous page" placement="bottom" enterDelay={400}>
        <span>
          <IconButton
            size="small"
            disabled={start === 0}
            onClick={() => {
              const newPage = page - 1;
              const newStart = newPage * count
              setPage(newPage);
              setStart(newStart);
              load(node, { start: newStart, count });
            }}
            style={{ borderRadius: 4, padding: 2 }}
          >
            <FaChevronLeft />
          </IconButton>
        </span>
      </Tooltip>
      <span style={{ fontSize: 13, color: "#888", marginBottom: 0 }}>
        Page: {page + 1}
      </span>
      <Tooltip title="Next page" placement="bottom" enterDelay={400}>
        <span>
          <IconButton
            size="small"
            disabled={!node.moreEntriesExist}
            onClick={() => { 
              const newPage = page + 1;
              const newStart = newPage * count
              setPage(newPage);
              setStart(newStart);
              load(node, { start: newStart, count });
            }}
            style={{ borderRadius: 4, padding: 2 }}
          >
            <FaChevronRight />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Entries per page" placement="right" enterDelay={400}>
        <TextField
          label="Amount per page"
          type="number"
          value={count}
          slotProps={{ input: {
            style: { height: "2.4375em"}
          }}}
          onChange={e => { 
            const newCount = Math.max(1, Number(e.target.value));
            setStart(0);
            setPage(0);
            setCount(newCount);
            load(node, { start: 0, count: newCount });
          }}
          margin="dense"
        />
      </Tooltip>
    </div>
  );
}