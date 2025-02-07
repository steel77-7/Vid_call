import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import VidContainer from "../Components/VidContainer";

interface Self {
  video: boolean;
  audio: boolean;
}

export default function () {
  //then an array of all the other peeps in the stream

  const [selfStream, setSelfStream] = useState({
    video: true,
    audio: false,
  });

  const socket = useSocket();
  const [self, setSelf] = useState<any>();

  async function playVideoFromCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(selfStream);
      setSelf(stream);
      console.log("stream set");
    } catch (error) {
      console.error("Error opening video camera.", error);
    }
  }
  useEffect(() => {
    playVideoFromCamera();
  }, []);

  return (
    <>
      <div className="fixed bg-zinc-700 h-screen min-w-screen">
        <VidContainer stream={self} />
      </div>
    </>
  );
}
