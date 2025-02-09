import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import VidContainer from "../Components/VidContainer";
import { peerConnection } from "../utils/webRtc";
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
  console.log(socket);
  const [self, setSelf] = useState<any>();
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  //this will make a call or a offer that will make a room and then anyone who joins will have to take that sdp and give their sdp too

  //the joiner will be first prompted to join the call
  const makeRoom = useCallback(async () => {
    const pc = new peerConnection();
    const offer = await pc.createOffer();
    socket?.send(
      JSON.stringify({
        type: "offer",
        payload: {
          SDP: offer,
        },
      })
    );
  }, []);

  //joining rooms
  //signaling to the serverand then it wouldgive me the others session description
  //but how to handle the ice candidates...I forgot 
  const joinRoom = useCallback(async (offer: any) => {
    const pc = new peerConnection();
    const ans = await pc.getAnswer(offer);
    socket?.send(
      JSON.stringify({
        type: "answer",
        payload: {
          SDP: ans,
        },
      })
    );
  }, []);

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

  useEffect(() => {
    if (!socket) {
      console.log("its empty");
      return;
    }
    console.log("here");
    /* 
    console.log(socket);
    socket.send(
      JSON.stringify({
        type: "SDP",
        payload: { SDP: "something" },
      })
    );
    socket.onmessage = (event: any) => {
      console.log("Data:", event.data);
    }; */

    socket.onmessage = (event: any) => {
      const type = event.type;
      switch (type) {
        case "offer":
          break;
        case "answer":
          break;
        default:
          console.log("invalid params");
      }
    };
  }, [socket]);

  return (
    <>
      <div className="fixed bg-zinc-700 h-screen min-w-screen">
        <VidContainer stream={self} />

        <div className="flex gap-10 ">
          <button className="bg-white rounded-md p-4" onClick={makeRoom}>
            make room
          </button>
          <button className="bg-white rounded-md  p-4">join room</button>
        </div>
      </div>
    </>
  );
}
