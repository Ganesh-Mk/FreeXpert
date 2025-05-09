import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

export default function Chatting() {
  const userData = localStorage.getItem("userData");
  const userId = userData ? JSON.parse(userData)._id : null;
  const navigate = useNavigate();

  if (!userId) {
    console.error("User not logged in!");
    return;
  }

  const { anotherGuyId = null } = useParams();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const chatContainerRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [unreadStatus, setUnreadStatus] = useState({});
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  // New state for tracking unread group messages
  const [groupUnreadStatus, setGroupUnreadStatus] = useState({});

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

  // Mark group messages as read when selecting a group
  useEffect(() => {
    if (selectedGroup?.id) {
      // Mark group as read in local state
      setGroupUnreadStatus(prev => ({
        ...prev,
        [selectedGroup.id]: false
      }));

      // Update the groups list to reflect read status
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === selectedGroup.id ? { ...group, hasUnread: false } : group
        )
      );
    }
  }, [selectedGroup]);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io(BACKEND_URL, { transports: ["websocket", "polling"] });
    setSocket(newSocket);

    // Notify server user is online
    newSocket.emit("userOnline", userId);

    // Load groups from localStorage
    const savedGroups = localStorage.getItem("chatGroups");
    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch (error) {
        console.error("Error parsing saved groups:", error);
        localStorage.setItem("chatGroups", JSON.stringify([]));
      }
    }

    // Load group unread status from localStorage
    const savedGroupUnreadStatus = localStorage.getItem("groupUnreadStatus");
    if (savedGroupUnreadStatus) {
      try {
        setGroupUnreadStatus(JSON.parse(savedGroupUnreadStatus));
      } catch (error) {
        console.error("Error parsing saved group unread status:", error);
        localStorage.setItem("groupUnreadStatus", JSON.stringify({}));
      }
    }

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
          setSelectedGroup(null);
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

  // Fetch group messages from localStorage
  const fetchGroupMessages = (groupId) => {
    try {
      const allGroupMessages = JSON.parse(localStorage.getItem("groupMessages") || "{}");
      setMessages(allGroupMessages[groupId] || []);
    } catch (error) {
      console.error("Error fetching group messages:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (message) => {
      if (selectedGroup && message.groupId === selectedGroup.id) {
        setMessages((prev) => [...prev, message]);

        // Save to localStorage
        const allGroupMessages = JSON.parse(localStorage.getItem("groupMessages") || "{}");
        if (!allGroupMessages[message.groupId]) {
          allGroupMessages[message.groupId] = [];
        }
        allGroupMessages[message.groupId].push(message);
        localStorage.setItem("groupMessages", JSON.stringify(allGroupMessages));
      } else if (message.sender === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
      } else if (message.groupId) {
        // Update group unread status
        setGroupUnreadStatus(prev => ({
          ...prev,
          [message.groupId]: true
        }));

        // Update groups with unread flag
        setGroups(prevGroups =>
          prevGroups.map(group =>
            group.id === message.groupId
              ? { ...group, hasUnread: true }
              : group
          )
        );

        // Add to localStorage even if not viewing
        const allGroupMessages = JSON.parse(localStorage.getItem("groupMessages") || "{}");
        if (!allGroupMessages[message.groupId]) {
          allGroupMessages[message.groupId] = [];
        }
        allGroupMessages[message.groupId].push(message);
        localStorage.setItem("groupMessages", JSON.stringify(allGroupMessages));
      } else {
        setUnreadStatus((prev) => ({
          ...prev,
          [message.sender]: true,
        }));
      }
    };

    // Updated to handle group messages consistently
    const handleReceiveGroupMessage = (message) => {
      // Always store group messages in localStorage
      const allGroupMessages = JSON.parse(localStorage.getItem("groupMessages") || "{}");
      if (!allGroupMessages[message.groupId]) {
        allGroupMessages[message.groupId] = [];
      }
      allGroupMessages[message.groupId].push(message);
      localStorage.setItem("groupMessages", JSON.stringify(allGroupMessages));

      if (selectedGroup && message.groupId === selectedGroup.id) {
        setMessages((prev) => [...prev, message]);
      } else {
        // Mark group as having unread messages
        setGroupUnreadStatus(prev => ({
          ...prev,
          [message.groupId]: true
        }));

        setGroups(prevGroups =>
          prevGroups.map(group =>
            group.id === message.groupId
              ? { ...group, hasUnread: true }
              : group
          )
        );
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("receiveGroupMessage", handleReceiveGroupMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("receiveGroupMessage", handleReceiveGroupMessage);
    };
  }, [socket, selectedUser, selectedGroup]);

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    if (selectedGroup) {
      // Send message to group
      const messageData = {
        senderId: userId,
        senderName: JSON.parse(userData).name || "User",
        groupId: selectedGroup.id,
        content: messageInput,
        timestamp: new Date(),
      };

      // Create temporary message for UI
      const tempMessage = {
        _id: Date.now().toString(),
        sender: userId,
        senderName: JSON.parse(userData).name || "User",
        groupId: selectedGroup.id,
        content: messageInput,
        createdAt: new Date(),
      };

      // Add to local messages
      setMessages((prev) => [...prev, tempMessage]);

      // Save to localStorage
      const allGroupMessages = JSON.parse(localStorage.getItem("groupMessages") || "{}");
      if (!allGroupMessages[selectedGroup.id]) {
        allGroupMessages[selectedGroup.id] = [];
      }
      allGroupMessages[selectedGroup.id].push(tempMessage);
      localStorage.setItem("groupMessages", JSON.stringify(allGroupMessages));

      // Send to all group members
      selectedGroup.members.forEach(member => {
        if (member._id !== userId) {
          socket.emit("sendMessage", {
            senderId: userId,
            recipientId: member._id,
            content: messageInput,
            groupId: selectedGroup.id,
            groupName: selectedGroup.name,
            senderName: JSON.parse(userData).name || "User"
          });
        }
      });

      // Emit for anyone listening to this group
      socket.emit("sendGroupMessage", messageData);

    } else if (selectedUser) {
      // Send direct message
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
      socket.emit("sendMessage", messageData);
    } else {
      return;
    }

    setMessageInput("");

    // Scroll to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Select a user to chat with
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    await fetchMessages(user._id);
  };

  // Select a group to chat with
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    fetchGroupMessages(group.id);

    // Mark group as read
    if (group.hasUnread) {
      setGroups(prevGroups =>
        prevGroups.map(g =>
          g.id === group.id ? { ...g, hasUnread: false } : g
        )
      );

      setGroupUnreadStatus(prev => ({
        ...prev,
        [group.id]: false
      }));

      // Save updated unread status to localStorage
      localStorage.setItem("groupUnreadStatus", JSON.stringify({
        ...groupUnreadStatus,
        [group.id]: false
      }));
    }
  };

  // Create new group
  const handleCreateGroup = () => {
    if (groupName.trim() === "" || selectedMembers.length === 0) {
      alert("Please enter a group name and select at least one member");
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      members: [...selectedMembers, { _id: userId, name: JSON.parse(userData).name || "You" }],
      createdAt: new Date(),
      hasUnread: false,
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);

    // Save to localStorage
    localStorage.setItem("chatGroups", JSON.stringify(updatedGroups));

    // Initialize empty messages array for this group
    const allGroupMessages = JSON.parse(localStorage.getItem("groupMessages") || "{}");
    allGroupMessages[newGroup.id] = [];
    localStorage.setItem("groupMessages", JSON.stringify(allGroupMessages));

    // Reset and close modal
    setGroupName("");
    setSelectedMembers([]);
    setShowGroupModal(false);

    // Select the new group
    handleSelectGroup(newGroup);
  };

  // Toggle member selection for group creation
  const toggleMemberSelection = (user) => {
    if (selectedMembers.some(member => member._id === user._id)) {
      setSelectedMembers(selectedMembers.filter(member => member._id !== user._id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
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

  // Save groups to localStorage when they change
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem("chatGroups", JSON.stringify(groups));
    }
  }, [groups]);

  // Save group unread status to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("groupUnreadStatus", JSON.stringify(groupUnreadStatus));
  }, [groupUnreadStatus]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-[calc(100vh)] bg-white text-gray-800 pt-16 flex flex-col md:flex-row">
      {/* Group creation modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-600">Create New Group</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter group name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Members</label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                {connections.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleMemberSelection(user)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.some(member => member._id === user._id)}
                      onChange={() => { }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex items-center">
                      <img
                        src={user.image || "https://cdn-icons-png.flaticon.com/512/10398/10398223.png"}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="ml-2 font-medium">{user.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connections and Groups list */}
      <div
        className={`${(selectedUser || selectedGroup) && window.innerWidth < 768 ? "hidden" : "block"
          } w-full md:w-1/4 border-r border-gray-200 overflow-y-auto h-full`}
      >
        <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-600">Chats</h2>
          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Group
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-blue-600">Loading...</div>
          </div>
        ) : (
          <div>
            {/* Groups section */}
            {groups.length > 0 && (
              <div className="mt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Groups</div>
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors ${selectedGroup?.id === group.id ? "bg-gray-200" : ""
                      }`}
                    onClick={() => handleSelectGroup(group)}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      {group.hasUnread && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="font-semibold truncate">{group.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {group.members.map(member => member.name).join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Direct connections section */}
            <div className="mt-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Direct Messages</div>
              {connections.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No connections found</div>
              ) : (
                connections.map((connection) => (
                  <div
                    key={connection._id}
                    className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors ${selectedUser?._id === connection._id ? "bg-gray-200" : ""
                      }`}
                    onClick={() => handleSelectUser(connection)}
                  >
                    <div className="relative">
                      <img
                        src={connection.image || "https://cdn-icons-png.flaticon.com/512/10398/10398223.png"}
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
          </div>
        )}
      </div>

      {/* Chat window */}
      <div
        className={`${(!selectedUser && !selectedGroup) && window.innerWidth < 768 ? "hidden" : "flex"
          } flex-col flex-1 h-full`}
      >
        {selectedUser || selectedGroup ? (
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center sticky top-0 z-10">
            {/* Back button - only visible on mobile */}
            <button
              className="md:hidden mr-2 text-blue-600"
              onClick={() => {
                setSelectedUser(null);
                setSelectedGroup(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {selectedUser ? (
              <>
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
              </>
            ) : selectedGroup ? (
              <>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-3 overflow-hidden flex-1">
                  <div className="font-semibold truncate">{selectedGroup.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {selectedGroup.members.length} members
                  </div>
                </div>
                {/* Group info button */}
                <button className="ml-2 text-blue-600 p-1 hover:bg-blue-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </>
            ) : null}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border-b border-gray-200 hidden md:block">
            <div className="font-semibold text-gray-500">
              Select a connection or group to start chatting
            </div>
          </div>
        )}

        {/* Group members list - only show for groups */}
        {selectedGroup && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedGroup.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center mr-1 text-xs">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white"
        >
          {selectedUser || selectedGroup ? (
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
                      {/* Show sender name for group messages */}
                      {selectedGroup && message.sender !== userId && (
                        <div className="text-xs font-semibold mb-1">
                          {message.senderName || "Unknown"}
                        </div>
                      )}
                      {message.content}
                      <div className="text-xs text-right mt-1" style={{ color: message.sender === userId ? '#e2e8f0' : '#94a3b8' }}>
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
                Select a connection or group to view messages
              </div>
            </div>
          )}
        </div>

        {/* Message input */}
        {(selectedUser || selectedGroup) && (
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