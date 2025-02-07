import React, { use, useEffect, useRef, useState } from "react";

interface ContainerVid {
  stream: any;
}

export default function VidContainer({ stream }: ContainerVid) {
  const videoRef = useRef<HTMLVideoElement>(null);

  //setting the vid here
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <>
      <div className="w-96 h-96 border border-b-black">
        <video id="localVideo" ref={videoRef} autoPlay playsInline controls={false} />
      </div>
    </>
  );
}
