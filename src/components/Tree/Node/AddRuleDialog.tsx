import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import type { Rule } from '../../../types/types'
import { useState } from 'react'
import type { TableNodeData } from '../../../data/TreeNodeData'
import { ButtonGroup, IconButton } from '@mui/material'
import { GridCloseIcon } from '@mui/x-data-grid'
import PositionDialog from './PositionDialog'

type AddRuleDialogProps = {
  open: boolean
  node: TableNodeData
  onClose: () => void
  rules: Rule[]
  onRuleSelect: (rule: Rule, position: number) => void
  title?: string
  showPositionDialog?: boolean
}

function splitPredicates(body: string): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  for (const element of body) {
    const char = element;
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) result.push(current.trim());
  return result;
}

export function getPredicateParts(body: string): string[] {
  return splitPredicates(body)
    .map(p => p.trim().replace(/[.\s]*$/, ""))
    .filter(p => p.includes('(') && p.endsWith(')'));
}

export function breakRuleString(label:string): string {
    const maxLength = 50;
    if (maxLength > label.length) { 
        return label; // no need to break it. 
    }

    const br = "<br>&emsp;";
    const ret = [label[0]];

    for (let i = 1; i < label.length; i++) {
      const char = label[i];
      const symbol = `${label[i-1]}${char}`; 
      
      ret.push(char);
      
      if (new Set([":-", "),", "],"]).has(symbol)) {
          ret.push(br);
      }
    }

    return ret.join("");
}

export default function AddRuleDialog({
  open,
  node,
  onClose,
  rules,
  onRuleSelect,
  title = "Rules",
  showPositionDialog = false
}: Readonly<AddRuleDialogProps>) {
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);

  const handleRuleClick = (rule: Rule) => {
    if (!showPositionDialog) { //if add below, add rule on position 0
      onRuleSelect(rule, 0);
      setSelectedRule(null);
      setPositionDialogOpen(false);
      return;
    }

    const body = rule.stringRepresentation.split(':-').map(s => s.trim())[1];
    const nodeName = node.getName();
    const possibleChildrenNames = getPredicateParts(body || "").map(p => p.split('(')[0].trim());
    
    const childrenWithSameName = possibleChildrenNames.filter(n => n === nodeName).length;
    if (childrenWithSameName === 1) {
      const pos = possibleChildrenNames.findIndex(n => n === nodeName);
      onRuleSelect(rule, pos);
      setSelectedRule(null);
      setPositionDialogOpen(false);
    } else { //if there are multiple children with the same name, show position dialog
      setSelectedRule(rule);
      setPositionDialogOpen(true);
    }
  };

  const handlePositionDialogClose = () => {
    setPositionDialogOpen(false)
    setSelectedRule(null)
  }

  return (<>
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ minWidth: 280, pb: 1, pt: 1.5 }}>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <GridCloseIcon />
      </IconButton>
      <DialogContent sx={{ margin: "auto", maxHeight: 500, p: 1, pb: 0 }}>
        <ButtonGroup 
          orientation="vertical" 
          aria-label="Vertical button group"
          sx={{ alignContent: "center"}}
        >
          {rules.map((rule, idx) => (
            <Button 
              key={idx} 
              sx={{ textTransform: 'none', textAlign: "left" }} 
              variant="outlined" 
              onClick={() => handleRuleClick(rule)}
            >
              <div 
                style={{ whiteSpace: "nowrap" }} 
                dangerouslySetInnerHTML={{ 
                  "__html": breakRuleString(rule.stringRepresentation) 
                }}
              />
            </Button>
          ))}
        </ButtonGroup>
      </DialogContent>
      <DialogActions sx={{ p: 1, pt: 0 }}>
      </DialogActions>
    </Dialog>

    <PositionDialog open={positionDialogOpen} onClose={handlePositionDialogClose} node={node} rule={selectedRule} onPosSelect={onRuleSelect} />
  </>)
}
