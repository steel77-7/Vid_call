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

  /* const [peeps, setPeeps] = useState<Map<string, RTCPeerConnection>>(new Map()); */
  const socket = useSocket();
  const self = useRef<any>(null);
  const [userid, setUserid] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const lc = useRef<peerConnection>(null);
  const peers = new Map<string, RTCPeerConnection>();

  useEffect(() => {
    setUserid(generateId(10));
  }, []);

  //this is obsolete rn so just use the join room
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
          RoomId: roomId,
          SDP: JSON.stringify(offer),
          UserId: userid,
        },
      })
    );
  }, [socket]);

  //in the offer part
  const joinRoom = async () => {
    const pc = new peerConnection();
    lc.current = pc;
    // console.log(offer);

    if (!roomId || roomId == "") {
      console.log(roomId);
      alert("Enter a room id first bitch ");
      return;
    }
    try {
      const offer = await lc.current.createOffer();
      //this is not how it will proceed
      socket?.send(
        JSON.stringify({
          Type: "join-room",
          Payload: {
            RoomId: roomId,
            SDP: JSON.stringify(offer),
            UserId: userid,
          },
        })
      );
    } catch (e: any) {
      console.log(e);
    }
  };

  /*   const sendStream = () => {
    console.log(self);
    if (!(lc.current && self.current)) {
      console.error("tracks not available",self, lc);
      return;
    }
    self.current.getTracks().forEach((track: any) => {
      lc.current?.peer.addTrack(track, self.current);
    });
  }; */
  const sendStream = () => {
    if (!(lc.current && self.current)) {
      console.error("Tracks not available", self, lc);
      return;
    }

    console.log("Adding tracks to peer connection");

    const existingSenders = lc.current.peer.getSenders();

    self.current.getTracks().forEach((track: any) => {
      // Check if the track is already added
      const trackAlreadyAdded = existingSenders.some(
        (sender) => sender.track === track
      );

      if (!trackAlreadyAdded) {
        lc.current?.peer.addTrack(track, self.current);
      } else {
        console.log("Track already added, skipping:", track);
      }
    });
  };

  //  const handleTracks
  async function playVideoFromCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(selfStream);
      self.current = stream;
      console.log("stream set");
    } catch (error) {
      console.error("Error opening video camera.", error);
    }
  }

  function handleStreams() {
    console.log("zdbfgdfhgo");
  }
  useEffect(() => {
    playVideoFromCamera().then(() => {
      if (lc.current) {
        sendStream();
      }
    });

    //lc.current?.peer.addEventListener("icecandidate", handleIceCandidates);
    lc.current?.peer.addEventListener("track", handleStreams);

    //handleIceCandidates();
  }, []);

  //handle the offer heere
  const handleOffer = async (event: any) => {
    console.log("offer", event.Payload.RoomId);
    const pc = new peerConnection();
    lc.current = pc;
    console.log(JSON.parse(event.Payload.SDP));
    try {
      const offer = await lc.current.getAnswer(JSON.parse(event.Payload.SDP));
      // const ans = await lc.current.getAnswer(offer);
      //this is not how it will proceed
      //  if (!roomId || roomId =='' || roomId ==" " ) throw new Error("room id is empty");
      socket?.send(
        JSON.stringify({
          Type: "answer", //herte is the answer
          Payload: {
            SDP: JSON.stringify(offer),
            RoomId: event.Payload.RoomId,
            UserId: userid,
          },
        })
      );
    } catch (e: any) {
      console.error(e);
    }
  };

  //make a peer connection when you get an asnwer
  const handleAnswer = async (event: any) => {
    //console.log("answer");
    console.log(event);
    if (!lc.current) {
      console.log(" creating a new peer for the current client");
      lc.current = new peerConnection();
    }
    try {
      await lc.current?.setRemoteDescription(JSON.parse(event.Payload.SDP)); //include the remote stream here as well
      sendStream();
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleIceCandiate = async (event: any) => {
    if (!lc.current) return;
    try {
      console.log("ice candidate");
      console.log("ice candidate : ", event.data.Payload.Candidate);
      lc.current.addIceCandidate(event.data);
    } catch (e: any) {
      console.error(e);
    }
  };

  //listengi to teevnts
  useEffect(() => {
    if (!socket) {
      console.log("its empty");
      return;
    }
    socket.onmessage = async (event: any) => {
      console.log(event.data);

      event = JSON.parse(event.data);
      const type = event.Type;
      console.log(type);

      switch (type) {
        case "offer": //get an offer to give an answer
          await handleOffer(event);
          break;
        case "answer": // you are not making a peer conneciton if you dont get an answer
          await handleAnswer(event);
          sendStream();
          break;
        case "icecandidate":
          await handleIceCandiate(event);
          break;
        default:
          console.log("invalid params");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (!self.current || !lc.current) return;

    console.log("Attaching self stream to peer connection");
    self.current.getTracks().forEach((track: any) => {
      lc.current?.peer.addTrack(track, self.current);
    });
  }, [self]);

  //icecandidate handling
  useEffect(() => {
    if (!lc.current) return;
    lc.current.peer.onicecandidate = (event) => {
      console.log("icecandidate for local peer");
      if (event.candidate) {
        socket?.send(
          JSON.stringify({
            Type: " icecandidate",
            Payload: {
              UserId: userid,
              RoomId: roomId,
              Candidate: JSON.stringify(event.candidate),
            },
          })
        );
      }
    };

    lc.current.peer.onconnectionstatechange = () => {
      if (!lc.current) return;
      console.log("Peer Connection State:", lc.current.peer.connectionState);

      if (lc.current.peer.connectionState === "connected") {
        console.log("✅ Peer successfully connected!");
      }
    };

    return () => {
      if (lc.current) {
        lc.current.peer.onicecandidate = null;
        lc.current.peer.onconnectionstatechange = null;
      }
    };
  }, []);

  useEffect(() => {
    // if(self && lc.current)
    // sendStream();
  }, [self]);
  /* 
  useEffect(() => {
    if (!self) return;
    console.log("Self stream available, sending tracks...");
    sendStream();
  }, [self]); */

  return (
    <>
      <div className="fixed bg-zinc-700 h-screen min-w-screen">
        <h1 className="text-4xl text-white">Room id : {roomId}</h1>

        <VidContainer stream={self.current} />
        <input
          type="text"
          className="h-10 w-96 bg-white m-3 outline-none rounded-sm"
          placeholder="Room..."
          value={roomId}
          onChange={(e: any) => setRoomId(e.target.value)}
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
