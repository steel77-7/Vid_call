import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import VidContainer from "../Components/VidContainer";
import { peerConnection } from "../utils/webRtc";

import { generateId } from "../utils/generateId";
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
  //console.log(socket);
  const [self, setSelf] = useState<any>();
  const [userid, setUserid] = useState<string | null>(null);
  //setting up the local peer
  const lc = useRef<peerConnection>(null);
  const peeps = new Map<string, RTCPeerConnection>();

  //this will make a call or a offer that will make a room and then anyone who joins will have to take that sdp and give their sdp too

  //the joiner will be first prompted to join the call

  useEffect(() => {
    setUserid(generateId(10));
  }, []);
  const makeRoom = useCallback(async () => {
    console.log("make room");

    const pc = new peerConnection();
    lc.current = pc;
    const offer = await lc.current.createOffer();
    if (!socket) console.log("NOOOOO");
    socket?.send(
      JSON.stringify({
        //make room mei bhi offer jaega
        Type: "join-room",
        Payload: {
          RoomId: "hello",
          SDP: JSON.stringify(offer),
          UserId: userid,
        },
      })
    );
  }, [socket]);

  //in the offer part
  const joinRoom = useCallback(
    async (offer: any) => {
      const pc = new peerConnection();
      lc.current = pc;
      console.log(offer);
      try {
        const ans = await lc.current.getAnswer(offer);
        //this is not how it will proceed
        socket?.send(
          JSON.stringify({
            Type: "join-room",
            Payload: {
              RoomId: "hello",
              SDP: JSON.stringify(ans),
              UserId: userid,
            },
          })
        );
      } catch (e: any) {
        console.log(e);
      }
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    if (lc.current)
      self.getTracks().forEach((track: any) => {
        lc.current?.peer.addTrack(track, self);
      });
  }, [socket]);

  //  const handleTracks
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

    socket.onmessage = async (event: any) => {
      console.log(event.data);

      event = JSON.parse(event.data);
      const type = event.Type;
      console.log(type);

      switch (type) {
        case "offer":
          //join room logic here
          console.log("offer");
          const pc = new peerConnection();
          lc.current = pc;
          console.log(JSON.parse(event.Payload.SDP));

          try {
            const offer = await lc.current.getAnswer(
              JSON.parse(event.Payload.SDP)
            );
            // const ans = await lc.current.getAnswer(offer);
            //this is not how it will proceed
            socket?.send(
              JSON.stringify({
                Type: "asnwer",
                Payload: {
                  RoomId: "hello",
                  SDP: JSON.stringify(offer),
                  UserId: userid,
                },
              })
            );
          } catch (e: any) {
            console.error(e);
          }
          break;
        case "answer":
          //console.log(event);
          console.log("answer");

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
        <h1 className="text-4xl text-white">{userid}</h1>
        <div className="flex gap-10 m-3 ">
          <button className="bg-white rounded-md p-4" onClick={makeRoom}>
            make room
          </button>
          <button className="bg-white rounded-md  p-4" onClick={joinRoom}>
            join room
          </button>
        </div>
      </div>
    </>
  );
}
