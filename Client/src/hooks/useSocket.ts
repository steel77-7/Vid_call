import { useState, useEffect } from "react";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const webSoc = new WebSocket(import.meta.env.VITE_SOCKET_URL);

    webSoc.onopen = () => {
      setSocket(webSoc);
      socket?.send(JSON.stringify({message:"connect"}))
    };

    webSoc.onclose = () => {
      setSocket(null);
    };

    return ()=> webSoc.close();
  }, []);

  return socket ? socket : null;
};
