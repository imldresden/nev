import { useEffect, useRef, useState } from "react";
import Scene from './components/Scene/Scene';
import type { TableEntriesForTreeNodesQuery, TreeForTableQuery, TableEntriesForTreeNodesResponse, TreeForTableResponse } from "./types/types";
import type { TreeNodeData } from "./data/TreeNodeData";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [message, setMessage] = useState<{ responseType: string, payload: TableEntriesForTreeNodesResponse | TreeForTableResponse } | null>(null);
  const [backdropOpen, setBackdropOpen] = useState(true);

  useEffect(() => {
    const bc = new BroadcastChannel("NemoVisualization");
    bcRef.current = bc;

    bc.addEventListener("message", event => {
      console.log("Received:", event.data);
      setMessage(event.data);
      setBackdropOpen(false)
    });

    return () => bc.close();
  }, []);

  const sendMessage = (msg: { queryType: string, payload: TableEntriesForTreeNodesQuery | TreeForTableQuery }) => {
    console.log("Sent:", msg)
    bcRef.current?.postMessage(msg);
    setBackdropOpen(true)
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const predicate = params.get("predicate");
    const query = params.get("query");

    if (!predicate || !query) return;
    let queries: string[] = [];
    try {
      const arr = JSON.parse(query);
      queries = Array.isArray(arr) ? arr.map(e => Array.isArray(e) ? e.join(",") : e) : [];
    } catch {
      console.error("Error parsing query:", query);
      return;
    }
    sendMessage({
      queryType: "treeForTable",
      payload: { predicate: predicate, tableEntries: { queries } }
    })
  }, []);

  const handleCodingButtonClicked = (node: TreeNodeData) => {
    console.log("CodingButton clicked on Node: ", node.id)
  }

  return (
    <div>
      <Scene sendMessage={sendMessage} message={message} codingButtonClicked={handleCodingButtonClicked} />
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default App;