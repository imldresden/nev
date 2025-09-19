import { Pagination, Select, MenuItem, Tooltip } from "@mui/material";

type PaginationBarProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  entriesLength: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showInfo?: boolean;
};

export default function PaginationBar({
  page,
  pageCount,
  pageSize,
  entriesLength,
  onPageChange,
  onPageSizeChange,
  showInfo = true
}: PaginationBarProps) {
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
          Showing entries {Math.min((page - 1) * pageSize + 1, entriesLength)}
          -
          {Math.min(page * pageSize, entriesLength)}
          {" of "}
          {entriesLength}
        </span>
      )}
      <Pagination
        count={pageCount}
        page={page}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        showFirstButton
        showLastButton
        size="small"
      />
      <Tooltip title="Entries per page" placement="right" enterDelay={400}>
        <Select
          value={pageSize}
          onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          size="small"
          style={{ minWidth: 80 }}
        >
          {[10, 20, 50, 100].map(size => (
            <MenuItem key={size} value={size}>{size} / page</MenuItem>
          ))}
        </Select>
      </Tooltip>
    </div>
  );
}