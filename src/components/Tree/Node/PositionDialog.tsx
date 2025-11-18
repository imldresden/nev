import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import type { Rule } from '../../../types/types'
import type { TableNodeData } from '../../../data/TreeNodeData'
import { ButtonGroup, IconButton } from '@mui/material'
import { GridCloseIcon } from '@mui/x-data-grid'
import { breakRuleString, getPredicateParts } from './AddRuleDialog'

type PositionDialogProps = {
  open: boolean
  node: TableNodeData
  onClose: () => void
  rule: Rule | null
  onPosSelect: (rule: Rule, position: number) => void
}

function getRulePositions(rule: Rule, nodeName: string): string[] {
  const [head, body] = rule.stringRepresentation.split(':-').map(s => s.trim());
  if (!body) return [];
  const bodyParts = getPredicateParts(body);
  const positions: string[] = [];
  for (let i = 0; i < bodyParts.length; i++) {
    const parts = [...bodyParts];
    if (parts[i].startsWith(nodeName)) {
      parts[i] = '[[ current root ]]';
      positions.push(`${head} :- ${parts.join(', ')}`);
    }
  }
  return positions;
}

export default function PositionDialog({
  open,
  node,
  onClose,
  rule,
  onPosSelect,
}: Readonly<PositionDialogProps>) {
  
  const handlePositionSelect = (idx: number) => {
    if (rule !== null) {
      onPosSelect(rule, idx)
      onClose();
    }
  }

  return (<>
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 1, pt: 1.5 }}>Choose Position: </DialogTitle>
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
          {rule && getRulePositions(rule, node.getName()).map((option, idx) => (
            <Button 
              key={idx} 
              sx={{ textTransform: 'none', textAlign: "left" }} 
              variant="outlined" 
              onClick={() => handlePositionSelect(idx)}
            >
              <div 
                style={{ whiteSpace: "nowrap" }} 
                dangerouslySetInnerHTML={{ 
                  "__html": breakRuleString(option)
                }}
              />
            </Button>
          ))}
        </ButtonGroup>
      </DialogContent>
      <DialogActions sx={{ p: 1, pt: 0 }}>
      </DialogActions>
    </Dialog>
  </>)
}
