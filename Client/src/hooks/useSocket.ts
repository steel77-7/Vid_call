import { useState, useEffect, useCallback } from "react";
import {generateId} from "../utils/generateId"
export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const webSoc = new WebSocket(import.meta.env.VITE_SOCKET_URL);

    webSoc.onopen = () => {
      console.log("WebSocket opened");
      setSocket(webSoc);

      setTimeout(() => {
        // webSoc.send("Hello Server!");
        webSoc.send(
          JSON.stringify({ Type: "connect", Payload: { UserId:'some' }})
        );
        console.log("Message sntt to server");
      }, 1000);
    };

    webSoc.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    return () => {
      console.log("Closing WebSocket connectoin");
      webSoc.close();
    };
  }, []);

  return socket;
};
