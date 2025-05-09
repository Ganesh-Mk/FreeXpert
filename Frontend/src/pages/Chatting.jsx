import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

export default function Chatting() {
  const userData = localStorage.getItem("userData");
  const userId = userData ? JSON.parse(userData)._id : null;

  if (!userId) {
    console.error("User not logged in!");
    return;
  }

  const { anotherGuyId = null } = useParams();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const chatContainerRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [unreadStatus, setUnreadStatus] = useState({});

  const checkUnreadFromSender = async (senderId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/unread-messages/${userId}/${senderId}`
      );
      return response.data.hasUnread;
    } catch (error) {
      console.error("Error checking unread messages:", error);
      return false;
    }
  };

  const markMessagesAsRead = async (senderId) => {
    if (!userId || !senderId) return;

    try {
      await axios.patch(`${BACKEND_URL}/mark-read`, {
        recipientId: userId,
        senderId: senderId,
      });

      // Update local unread status
      setUnreadStatus((prev) => ({
        ...prev,
        [senderId]: false,
      }));

      if (selectedUser) {
        await fetchMessages(selectedUser._id);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      navigate("/error");
    }
  };

  // Update the useEffect for marking messages as read
  useEffect(() => {
    if (selectedUser?._id) {
      markMessagesAsRead(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io(BACKEND_URL, { transports: ["websocket", "polling"] });
    setSocket(newSocket);

    // Notify server user is online
    newSocket.emit("userOnline", userId);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("userOnline", userId);
  }, [socket]);

  // Fetch user data and connections
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/user/${userId}`);
      const connectionsData = response.data.connections || [];

      console.log("Connections : ", response.data.connections);

      // Fetch details for each connection
      const connectionPromises = connectionsData.map((connectionId) =>
        axios.get(`${BACKEND_URL}/user/${connectionId}`)
      );

      const connectionResults = await Promise.all(connectionPromises);
      const connectionUsers = connectionResults.map((res) => res.data);
      const unreadPromises = connectionUsers.map(async (user) => ({
        id: user._id,
        hasUnread: await checkUnreadFromSender(user._id),
      }));
      const unreadResults = await Promise.all(unreadPromises);

      const newUnreadStatus = unreadResults.reduce((acc, { id, hasUnread }) => {
        acc[id] = hasUnread;
        return acc;
      }, {});

      setUnreadStatus(newUnreadStatus);
      setConnections(connectionUsers);

      if (anotherGuyId) {
        const initialUser = connectionUsers.find(
          (user) => user._id === anotherGuyId
        );
        if (initialUser) {
          setSelectedUser(initialUser);
          await fetchMessages(initialUser._id);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  // Fetch messages between current user and selected user
  const fetchMessages = async (recipientId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/${userId}/${recipientId}`
      );

      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };


  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (message) => {
      if (message.sender === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnreadStatus((prev) => ({
          ...prev,
          [message.sender]: true,
        }));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [socket, selectedUser]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    const messageData = {
      senderId: userId,
      recipientId: selectedUser._id,
      content: messageInput,
    };


    // Optimistic update
    const tempMessage = {
      _id: Date.now().toString(),
      sender: userId,
      recipient: selectedUser._id,
      content: messageInput,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessageInput("");

    // Emit via Socket.IO
    socket.emit("sendMessage", messageData);

    // Scroll to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Select a user to chat with
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    await fetchMessages(user._id);
  };

  useEffect(() => {
    fetchUserData();

    // Polling for new messages (every 10 seconds)
    const intervalId = setInterval(() => {
      if (selectedUser) {
        fetchMessages(selectedUser._id);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <div className="h-[calc(100vh)] bg-white text-gray-800 pt-16 flex flex-col md:flex-row">
      {/* Connections list (full screen on mobile, sidebar on desktop) */}
      <div
        className={`${selectedUser && window.innerWidth < 768 ? "hidden" : "block"
          } w-full md:w-1/4 border-r border-gray-200 overflow-y-auto h-full`}
      >
        <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-blue-600">Connections</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-blue-600">Loading connections...</div>
          </div>
        ) : (
          <div>
            {connections.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">No connections found</div>
            ) : (
              connections.map((connection) => (
                <div
                  key={connection._id}
                  className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors ${selectedUser?.id === connection._id ? "bg-gray-200" : ""
                    }`}
                  onClick={() => handleSelectUser(connection)}
                >
                  <div className="relative">
                    <img
                      src={connection.image || "default-image-url"}
                      alt={connection.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {/* Green dot for unread messages */}
                    {unreadStatus[connection._id] && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                    {/* Online status dot */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="font-semibold truncate">{connection.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {connection.email}
                    </div>
                  </div>
                  {/* Last message time (example) */}
                  <div className="text-xs text-gray-500 ml-2">
                    {/* Could be dynamically populated */}
                    {Math.random() > 0.5 ? "Today" : "Yesterday"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div
        className={`${!selectedUser && window.innerWidth < 768 ? "hidden" : "flex"
          } flex-col flex-1 h-full`}
      >
        {selectedUser ? (
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center sticky top-0 z-10">
            {/* Back button - only visible on mobile */}
            <button
              className="md:hidden mr-2 text-blue-600"
              onClick={() => handleSelectUser(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <img
              src={
                selectedUser.image ||
                "https://cdn-icons-png.flaticon.com/512/10398/10398223.png"
              }
              alt={selectedUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3 overflow-hidden flex-1">
              <div className="font-semibold truncate">{selectedUser.name}</div>
              <div className="text-xs text-gray-500 truncate">{selectedUser.about}</div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border-b border-gray-200 hidden md:block">
            <div className="font-semibold text-gray-500">
              Select a connection to start chatting
            </div>
          </div>
        )}

        {/* Messages area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white"
        >
          {selectedUser ? (
            messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === userId
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${message.sender === userId
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                    >
                      {message.content}
                      <div className="text-xs text-gray-300 mt-1 text-right">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-gray-500 text-center">
                  No messages yet. Start a conversation!
                </div>
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center md:flex">
              <div className="text-gray-500 text-center">
                Select a connection to view messages
              </div>
            </div>
          )}
        </div>

        {/* Message input */}
        {selectedUser && (
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg px-4 py-3 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
