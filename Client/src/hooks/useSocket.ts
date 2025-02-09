import { useState, useEffect } from "react";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const webSoc = new WebSocket(import.meta.env.VITE_SOCKET_URL);

    webSoc.onopen = () => {
      console.log("WebSocket opened");
      setSocket(webSoc);

      setTimeout(() => {
        webSoc.send("Hello Server!"); 
        webSoc.send(JSON.stringify({ message: "connect" }));
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
