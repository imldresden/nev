import IndentedTree from "../Tree/IndentedTree";
import { TreeNodeData } from "../../data/TreeNodeData";
import '../../assets/Overlay.css'
import 'typeface-roboto';
import { Tooltip } from '@mui/material';
import { useState } from 'react';
import { Resizable } from "re-resizable";
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

type SidePanelProps = {
  open: boolean;
  topOffset?: number;
  onClose: (open: boolean) => void;
  rootNode: TreeNodeData;
  hoveredNode: TreeNodeData | null;
  setHoveredNode: (node: TreeNodeData | null) => void;
  onNodeClick: (node: TreeNodeData, bool: boolean) => void;
};

export default function SidePanel({
  open,
  topOffset = 0,
  onClose,
  rootNode,
  hoveredNode,
  setHoveredNode,
  onNodeClick,
}: Readonly<SidePanelProps>) {
  const [drawerWidth, setDrawerWidth] = useState(400);

  const HANDLE_WIDTH = 2;
  return (
    <>
      {!open && (
        <Tooltip title="Open the overview tree!" placement="left" enterDelay={500}>
          <button
            className="overlay-toggle-btn"
            style={{ left: 0, top: `calc(50% + ${topOffset / 2}px)` }}
            onClick={() => onClose(true)}
          >
            <IoIosArrowForward />
          </button>
        </Tooltip>
      )}
      {open && (
        <Tooltip title="Close the overview tree!" placement="left" enterDelay={500}>
          <button
            className="overlay-toggle-btn"
            onClick={() => onClose(false)}
            style={{
              position: 'fixed',
              top: `calc(50% + ${topOffset / 2}px)`,
              left: drawerWidth - HANDLE_WIDTH,
              transform: 'translateY(-50%)',
              zIndex: 4,
            }}
          >
            <IoIosArrowBack />
          </button>
        </Tooltip>
      )}
      {/* somehow css doesnt work, so inline */}

      {open && (
        <div
          style={{
            position: "fixed",
            top: topOffset,
            bottom: 0,
            left: 0,
            zIndex: 4,
            width: drawerWidth,
          }}
        >
          <Resizable
            size={{ width: drawerWidth, height: "100%" }}
            minWidth={150}
            maxWidth={700}
            enable={{ right: open }}
            handleStyles={{
              right: {
                cursor: "ew-resize",
              }
            }}
            onResize={(_e, _direction, ref) => {
              setDrawerWidth(ref.offsetWidth);
            }}
            style={{
              background: "#fff",
              boxShadow: "2px 0 8px rgba(0,0,0,0.07)",
              height: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
              transition: "width 0.2s",
              fontFamily: "Roboto",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                padding: 12,
                boxSizing: "border-box",
                overflow: "hidden",
                transition: "width 0.2s",
              }}
            >
              <IndentedTree
                node={rootNode}
                onNodeClick={onNodeClick}
                hoveredNode={hoveredNode}
                setHoveredNode={setHoveredNode}
              />
            </div>
          </Resizable>
        </div>
      )}
    </>
  );
}
