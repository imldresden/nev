import { useEffect, useRef, useState } from "react";
import Scene from './components/Scene/Scene';
import type { TableEntriesForTreeNodesQuery, TreeForTableQuery, TableEntriesForTreeNodesResponse, TreeForTableResponse } from "./types/types";
import type { TreeNodeData } from "./data/TreeNodeData";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import shortid from 'shortid';

function App() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [id] = useState(shortid.generate());
  const [message, setMessage] = useState<{ responseType: string, payload: TableEntriesForTreeNodesResponse | TreeForTableResponse } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backdropOpen, setBackdropOpen] = useState(true);

  useEffect(() => {
    const bc = new BroadcastChannel("NemoVisualization");
    bcRef.current = bc;

    bc.addEventListener("message", event => {
      console.log("Received:", event.data);
      
      setBackdropOpen(false);
      
      if (event.data.id === id) {
        if (event.data.error) {
          setError(event.data.error);  
        } else {
          setMessage(event.data);
        }
      }
    });

    return () => bc.close();
  }, []);

  const sendMessage = (msg: { queryType: string, payload: TableEntriesForTreeNodesQuery | TreeForTableQuery }) => {
    const idmsg = { 
      id,
      queryType: msg.queryType, 
      payload: msg.payload, 
    };
    console.log(`Sent ${msg.queryType === "treeForTable" ? 'Type 1' : 'Type 2' }: `, idmsg);
    bcRef.current?.postMessage(idmsg);
    setBackdropOpen(true);
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
      <Scene 
        error={error}
        message={message} 
        sendMessage={sendMessage} 
        codingButtonClicked={handleCodingButtonClicked} 
      />
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