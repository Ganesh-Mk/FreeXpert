import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import axios from "axios";

export default function VideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const userData = localStorage.getItem("userData");
  const user = userData ? JSON.parse(userData) : null;
  const userId = user?._id;
  const userName = user?.name || "User";

  const [appID, setAppID] = useState('1014196126'); // Replace with your Zegocloud App ID
  const [serverSecret, setServerSecret] = useState("87cbf365d595f9111eb3f401a3ee344c"); // Replace with your Server Secret

  const [zg, setZg] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [waitingForParticipants, setWaitingForParticipants] = useState(true);

  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Generate a token for authentication
  const generateToken = (userId, roomId, privilege = 1, expire_time = 3600) => {
    // In a production environment, token should be generated on the server side for security
    // This is a simplified client-side implementation for demonstration purposes
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(Math.random() * 100000);

    // For a real implementation, use a proper token generation library on your server
    // and return the token via API call
    return "temporary_token_" + userId + "_" + roomId + "_" + timestamp + "_" + nonce;
  };

  // Modify the useEffect hook to handle errors better and prevent redirects

  useEffect(() => {
    if (!roomId || !userId) {
      console.error("Missing roomId or userId, redirecting to home");
      navigate("/");
      return;
    }

    // Initialize Zegocloud
    const zgEngine = new ZegoExpressEngine(appID, serverSecret);
    setZg(zgEngine);

    // Set up event listeners - same as before

    // Join the room and start local preview when component mounts
    const joinRoom = async () => {
      try {
        // Generate a token for authentication
        const token = generateToken(userId, roomId);

        // Login to the room
        await zgEngine.loginRoom(roomId, token, { userID: userId, userName: userName });
        console.log("Login success");

        // Create local stream
        const stream = await zgEngine.createStream({
          camera: { audio: true, video: true }
        }).catch(err => {
          console.error("Failed to create stream:", err);
          // Don't redirect, just show an error message in the UI
          return null;
        });

        if (!stream) return;

        // Set local stream
        setLocalStream(stream);

        // Set local video view - make sure the ref exists before using it
        if (localVideoRef.current) {
          zgEngine.setLocalVideoView(stream, localVideoRef.current);
        } else {
          console.error("Local video ref is null");
        }

        // Start publishing
        const streamID = `${roomId}_${userId}_${Date.now()}`;
        await zgEngine.startPublishingStream(streamID, stream);
        console.log("Publishing stream: ", streamID);
      } catch (error) {
        console.error("Failed to join room: ", error);
        // Don't redirect, just show an error in the UI
      }
    };

    // Add a slight delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      joinRoom();
    }, 5000);


  }, [roomId, userId, userName, appID, serverSecret, navigate]);

  const toggleMute = () => {
    if (zg && localStream) {
      zg.muteAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (zg && localStream) {
      zg.muteVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenSharing = async () => {
    if (!zg) return;

    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        zg.stopPublishingStream();
        zg.destroyStream(screenStreamRef.current);
        screenStreamRef.current = null;
      }

      // Resume camera stream
      if (localStream) {
        const streamID = `${roomId}_${userId}_${Date.now()}`;
        await zg.startPublishingStream(streamID, localStream);
      }
    } else {
      // Start screen sharing
      try {
        // Stop publishing camera stream
        zg.stopPublishingStream();

        // Create screen capture stream
        const screenStream = await zg.createStream({
          screen: { audio: true, video: true }
        });

        // Save reference
        screenStreamRef.current = screenStream;

        // Update local preview
        zg.setLocalVideoView(screenStream, localVideoRef.current);

        // Start publishing screen
        const streamID = `${roomId}_${userId}_screen_${Date.now()}`;
        await zg.startPublishingStream(streamID, screenStream);
      } catch (error) {
        console.error("Failed to start screen sharing: ", error);
        return;
      }
    }

    setIsScreenSharing(!isScreenSharing);
  };

  const endCall = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
        <h1 className="text-xl font-bold">Video Call</h1>
        <div className="text-sm bg-blue-600 px-3 py-1 rounded-full">
          Room ID: {roomId}
        </div>
      </div>

      {/* Video container */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Local video */}
        <div className="w-full md:w-1/4 h-1/4 md:h-auto relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
            You{isMuted && " (Muted)"}{isVideoOff && " (Video Off)"}
          </div>
        </div>

        {/* Remote videos */}
        <div className="flex-1 relative bg-gray-800 rounded-lg overflow-hidden" id="remote-streams-container">
          {waitingForParticipants && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-4">👋</div>
                <div className="text-xl font-medium">Waiting for others to join...</div>
                <div className="mt-4 text-sm">
                  Share the room ID or link with others to invite them to this call
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-center">
        <div className="flex space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.354 5.354l-3.179 3.18m0 0l-6.6 6.6m6.6-6.6l-6.6-6.6m0 0L3.354 5.354" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 9.5v5m-4-2.5h8" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {isVideoOff ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleScreenSharing}
            className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}