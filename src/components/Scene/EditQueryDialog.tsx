import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import React, { useState, useEffect } from "react";
import type { TableEntryResponse } from "../../types/types";

type EditQueryDialogProps = {
    open: boolean;
    predicate: string;
    query: string[];
    entries: TableEntryResponse[];
    onClose: () => void;
    onApply: (queries: string[]) => void;
};

const EditQueryDialog: React.FC<EditQueryDialogProps> = ({
    open,
    predicate,
    query,
    entries,
    onClose,
    onApply,
}) => {
    const [localPredicate, setLocalPredicate] = useState(predicate);
    const [localQuery, setLocalQuery] = useState(query);

    useEffect(() => {
        setLocalPredicate(predicate);
        setLocalQuery(query);
    }, [predicate, query, open]);

    const handleChange = (event: SelectChangeEvent<typeof query>) => {
        const { target: { value }, } = event;
        setLocalQuery(typeof value === 'string' ? value.split(",") : value)
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{
                minWidth: "420px",
                maxWidth: "90vw"
            }}
        >
            <DialogTitle>Edit Predicate & Query</DialogTitle>
            <DialogContent>
                <div style={{ marginBottom: 12 }}>
                    <label style={{ fontWeight: "bold" }}>Predicate: </label>
                    {localPredicate}
                    {/* <input
                        type="text"
                        value={localPredicate}
                        onChange={e => setLocalPredicate(e.target.value)}
                        style={{ width: "100%", marginTop: 2, marginBottom: 6, padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
                        placeholder="Predicate"
                    /> */}
                </div>
                <div>
                    <label style={{ fontWeight: "bold" }}>Change Query Restriction (Current Facts in Root):</label>
                    <Select
                        multiple
                        value={localQuery}
                        onChange={handleChange}
                        input={<OutlinedInput label="Query" sx={{ '& fieldset': { display: 'none' } }} />}
                        MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                        style={{
                            width: "100%",
                            height: 25,
                            marginTop: 2,
                            marginBottom: 6,
                            padding: 4,
                            borderRadius: 4,
                            border: "1px solid #ccc",
                        }}
                    >
                        {entries.map((fact) => (
                            <MenuItem key={fact.entryId} value={fact.termTuple.join(',')}>
                                '{fact.termTuple.join(',')}'
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            </DialogContent>
            <DialogActions>
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    width: "100%",
                    gap: 8,
                    paddingRight: 16
                }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={onClose}
                            style={{ padding: "6px 12px" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => { onApply(localQuery); onClose() }}
                            style={{ padding: "6px 12px" }}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default EditQueryDialog;
