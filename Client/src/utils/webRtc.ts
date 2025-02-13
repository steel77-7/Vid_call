export class peerConnection {
  public peer: RTCPeerConnection;
  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
  }

  //create the offer here
  async createOffer() {
    if (!this.peer) return;
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  //set the local description here
  async setLocalDescription(sdp: any) {
    if (this.peer)
      this.peer.setLocalDescription(new RTCSessionDescription(sdp));
  }
  async setRemoteDescription(sdp: any) {
    console.log(sdp);
    if (this.peer)
      this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
  }


  //adding the icecandidate frrom here 
  async addIceCandidate(data: any) {
    try {
      await this.peer.addIceCandidate(
        new RTCIceCandidate(JSON.parse(data.Payload.Candidate))
      );
    } catch (e: any) {
      console.error(e);
    }
  }

  //push the icecandidated into the peer obj
  /*  async handleIceCandidate() {
    this.peer.onicecandidate = async (event) => {
      await this.peer.addIceCandidate(event.candidate?.toJSON());
    };
  } */

  //give the answer here
  async getAnswer(offer: any) {
    if (!this.peer) return;
    await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(new RTCSessionDescription(answer));
    return answer;
  }
}
