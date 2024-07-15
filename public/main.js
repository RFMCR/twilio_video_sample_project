const form = document.getElementById("room-name-form");
const roomNameInput = document.getElementById("room-name-input");
const container = document.getElementById("video-container");
const sharecontainer =  document.getElementById("sharescreen-container");
let groom = null;


const startRoom = async (event) => {
    // prevent a page reload when a user submits the form
    event.preventDefault();
    // hide the join form
    form.style.visibility = "hidden";
    // retrieve the room name
    const roomName = roomNameInput.value;
 
    // fetch an Access Token from the join-room route
    const response = await fetch("/join-room", {
        method: "POST",
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName: roomName }),
    });
    const { token } = await response.json();

    // join the video room with the token
    const room = await joinVideoRoom(roomName, token,3,3);
    groom = room;
    //console.log(groom);

    setNetworkQualityConfiguration(room,3,3);
    setupNetworkQualityUpdates(room,handleQTReport)
    setupDominantSpeakerUpdates(room,handledominant)


    // render the local and remote participants' video and audio tracks
    handleConnectedParticipant(room.localParticipant);
    room.participants.forEach(handleConnectedParticipant);
    room.on("participantConnected", handleConnectedParticipant);

    // handle cleanup when a participant disconnects
    room.on("participantDisconnected", handleDisconnectedParticipant);
    window.addEventListener("pagehide", () => room.disconnect());
    window.addEventListener("beforeunload", () => room.disconnect());

    
};

const handledominant=()=>{
  console.log("Dominant")
}

const handleQTReport = (evt) => {
  console.log(evt);
}

const handleShareScreen = async () => {
  // const sharecontainer = document.getElementById("sharescreen-container");
  // sharecontainer.innerText = "RENDERING"
  screenTrack = await createScreenTrack(720, 720);
  screenTrack.attach(sharecontainer);
  console.log(screenTrack)
  // Publish screen track to room
  groom.localParticipant.publishTrack(screenTrack);
}

const handleConnectedParticipant = (participant) => {
    // create a div for this participant's tracks
    const participantDiv = document.createElement("div");
    participantDiv.setAttribute("id", participant.identity);

  const islocalParticipant = participant.identity === groom.localParticipant.identity;
  if (islocalParticipant)
  {
    const participantMuteAudio= document.createElement('button');
    participantMuteAudio.id = `Audio${participant.identity}`;
    participantMuteAudio.textContent = "Mute"
    participantMuteAudio.addEventListener("click",togglemute);
    
    const participantMuteVideo= document.createElement('button');
    participantMuteVideo.id = `Video${participant.identity}`;
    participantMuteVideo.textContent = "Hide"
    participantMuteVideo.addEventListener("click",togglevideo);


    const sharescreen = document.createElement("button");
    sharescreen.setAttribute("id","btnlocalShare")
    sharescreen.textContent = "Share Screen";
    sharescreen.addEventListener("click",handleShareScreen)
    
    participantDiv.appendChild(participantMuteAudio);
    participantDiv.appendChild(participantMuteVideo);
    participantDiv.appendChild(sharescreen);
  }
    container.appendChild(participantDiv);
  
    // iterate through the participant's published tracks and
    // call `handleTrackPublication` on them
    participant.tracks.forEach((trackPublication) => {  
      handleTrackPublication(trackPublication, participant);
    });
  
    // listen for any new track publications
    participant.on("trackPublished", handleTrackPublication);
  };
  
  //const handleTrackPublication = (trackPublication, participant) => {
    const handleTrackPublication = (trackPublication) => {
    
    function displayTrack(track) {
      // append this track to the participant's div and render it on the page
      const participantDiv = document.getElementById(groom.localParticipant.identity);
      // track.attach creates an HTMLVideoElement or HTMLAudioElement
      // (depending on the type of track) and adds the video or audio stream
      participantDiv.append(track.attach());
    }
  
    // check if the trackPublication contains a `track` attribute. If it does,
    // we are subscribed to this track. If not, we are not subscribed.
    if (trackPublication.track) {
      displayTrack(trackPublication.track);
    }
  
    // listen for any new subscriptions to this track publication
    trackPublication.on("subscribed", displayTrack);
  };
  
  const handleDisconnectedParticipant = (participant) => {
    // stop listening for this participant
    participant.removeAllListeners();
    // remove this participant's div from the page
    const participantDiv = document.getElementById(participant.identity);
    participantDiv.remove();
  };
  
  const joinVideoRoom = async (roomName, token, localVerbosity, remoteVerbosity) => {
    // join the video room with the Access Token and the given room name
    const room = await Twilio.Video.connect(token, {
      room: roomName,
      dominantSpeaker: true,
      // networkQuality: {
      //   local: localVerbosity,
      //   remote: remoteVerbosity
      // }
    });
    return room;
  };

 const togglemute = (e)=>{
  //console.log(e.target.id)
  const id = e.target.id;
  console.log(id)
  const btn = document.getElementById(id);
  if (btn.textContent==="Mute"){
    muteYourAudio(groom);
    btn.textContent = "Unmute"
  }
  else{
    unmuteYourAudio(groom);
    btn.textContent = "Mute"
  }
 }


 const togglevideo = (e)=>{
  //console.log(e.target.id)
  const id = e.target.id;
  console.log(id)
  const btn = document.getElementById(id);
  if (btn.textContent==="Hide"){
    muteYourVideo(groom);
    btn.textContent = "UnHide"
  }
  else{
    unmuteYourVideo(groom);
    btn.textContent = "Hide"
  }
 }



  form.addEventListener("submit", startRoom);
