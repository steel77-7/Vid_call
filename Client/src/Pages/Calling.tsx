import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import VidContainer from "../Components/VidContainer";
import { peerConnection } from "../utils/webRtc";

import{generateId} from "../utils/generateId"
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

  //will have the id and the peer connection ?????
  /* const [peeps, setPeeps] = useState<Map<string, RTCPeerConnection>>(new Map()); */
  const socket = useSocket();
  console.log(socket);
  const [self, setSelf] = useState<any>();

  //setting up the local peer
  const lc = useRef<peerConnection>(null);
  const peeps = new Map<string, RTCPeerConnection>();

  //this will make a call or a offer that will make a room and then anyone who joins will have to take that sdp and give their sdp too

  //the joiner will be first prompted to join the call
  const makeRoom = useCallback(async () => {
    const pc = new peerConnection();
    lc.current = pc;
    const offer = await lc.current.createOffer();
    socket?.send(
      JSON.stringify({
        type: "offer",
        payload: {
          RoomId : generateId(10),
          SDP: offer,
        },
      })
    );
  }, []);

  const joinRoom = useCallback(async (offer: any) => {
    const pc = new peerConnection();
    lc.current = pc;
    try {
      const ans = await lc.current.getAnswer(offer);
      socket?.send(
        JSON.stringify({
          type: "answer",
          payload: {
            SDP: ans,
          },
        })
      );
    } catch (e: any) {
      console.log(e);
    }
  }, []);

  const sendStream = useCallback(() => {
    if (lc.current)
      self.getTracks().forEach((track: any) => {
        lc.current?.peer.addTrack(track, self);
      });
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

  async function handleIceCandidates() {
    if (!lc.current) return;
    lc.current?.peer.addEventListener("icecandidate", async (e: any) => {
      try {
        if (!e.candidate) return;
        await lc.current?.peer.addIceCandidate(e.candidate);
      } catch (e: any) {
        console.log(e);
      }
    });
  }

  useEffect(() => {
    playVideoFromCamera();
  }, []);

  useEffect(() => {
    if (!socket) {
      console.log("its empty");
      return;
    }
    console.log(Math.random().toString(36).slice(2),Math.random().toString(36).slice(2));
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
        <input
          type="text"
          className="h-10 w-96 bg-white m-3 outline-none rounded-sm"
          placeholder="Room..."
        />
        <div className="flex gap-10 m-3 ">
          <button className="bg-white rounded-md p-4" onClick={makeRoom}>
            make room
          </button>
          <button className="bg-white rounded-md  p-4">join room</button>
        </div>
      </div>
    </>
  );
}
