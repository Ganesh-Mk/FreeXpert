import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiUsers,
  FiCopy,
  FiCheck,
  FiGrid,
  FiHome,
  FiHash,
} from "react-icons/fi";

const WorkspaceManagement = () => {
  const [hasWorkspace, setHasWorkspace] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceColor, setWorkspaceColor] = useState("#3B82F6"); // Default blue
  const [workspaces, setWorkspaces] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Colors for workspace icons
  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#6366F1", // Indigo
    "#14B8A6", // Teal
  ];

  // Fetch workspaces from backend
  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      // Get user ID from localStorage or wherever it's stored in your app
      const userId = localStorage.getItem("userId"); // Replace with your actual user ID source
      console.log("User Id : ", userId)

      const response = await axios.get(
        `${BACKEND_URL}/findWorkspaces`, {
          params: { userId }
        }
      );
      console.log(response)

      if (response.data && response.data.workspaces) {
        // Transform data if necessary (e.g., adding UI-specific properties)
        const transformedWorkspaces = response.data.workspaces.map(
          (workspace) => ({
            ...workspace,
            id: workspace._id, // Ensure ID is properly mapped
            color: workspace.color || getRandomColor(), // Use color from backend or assign one
            inviteLink: `${window.location.origin}/invite/${workspace._id}`,
            members: workspace.members?.length || 1,
          })
        );

        setWorkspaces(transformedWorkspaces);

        if (transformedWorkspaces.length > 0) {
          setHasWorkspace(true);
          setCurrentWorkspace(transformedWorkspaces[0]);
        } else {
          // No workspaces found, show the create workspace modal
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      // Fall back to localStorage if API fails
      fallbackToLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback to localStorage if API fails
  const fallbackToLocalStorage = () => {
    const storedWorkspaces = localStorage.getItem("workspaces");

    if (storedWorkspaces) {
      const parsedWorkspaces = JSON.parse(storedWorkspaces);
      setWorkspaces(parsedWorkspaces);

      if (parsedWorkspaces.length > 0) {
        setHasWorkspace(true);
        setCurrentWorkspace(parsedWorkspaces[0]);
      } else {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  // Get a random color from the colors array
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Fetch workspaces on component mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Save workspaces to localStorage whenever they change (as backup)
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem("workspaces", JSON.stringify(workspaces));
    }
  }, [workspaces]);

  // Handle workspace creation
  const handleCreateWorkspace = async () => {
    if (workspaceName.trim() === "") return;

    try {
      const userId = localStorage.getItem("userId") || "default"; // Replace with your actual user ID source
      console.log(workspaceColor)

      const response = await axios.post(`${BACKEND_URL}/setWorkspaceName`, {
        name: workspaceName.trim(),
        userId,
        color: workspaceColor,
      });

      const newWorkspaceFromBackend = response.data.workspace;

      // Add custom fields like color and inviteLink (if not stored in DB)
      const newWorkspace = {
        ...newWorkspaceFromBackend,
        id: newWorkspaceFromBackend._id,
        color: workspaceColor,
        inviteLink: `${window.location.origin}/invite/${newWorkspaceFromBackend._id}`,
        members: 1, // or update from backend if returned
      };

      setWorkspaces((prev) => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      setHasWorkspace(true);
      setShowModal(false);
      setWorkspaceName("");
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Failed to create workspace. Please try again.");
    }
  };

  // Generate invitation link
  const generateInviteLink = (workspaceId) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    setCurrentWorkspace(workspace);
    setShowInviteModal(true);
  };

  // Copy invitation link to clipboard
  const copyInviteLink = () => {
    if (currentWorkspace) {
      navigator.clipboard.writeText(currentWorkspace.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Switch workspace
  const switchWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
  };

  // Show channel creation modal (to be implemented)
  const showAddChannelModal = () => {
    // Implement channel creation functionality
    console.log("Add channel for workspace:", currentWorkspace?.id);
    // You would implement a modal and API call here
    alert("Channel creation feature will be implemented here");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Workspaces</h1>
        </div>

        {/* Workspace List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={`flex items-center p-3 mb-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                  currentWorkspace?.id === workspace.id ? "bg-gray-100" : ""
                }`}
                onClick={() => switchWorkspace(workspace)}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white mr-3"
                  style={{ backgroundColor: workspace.color }}
                >
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="font-medium">{workspace.name}</div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions Panel */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="w-full flex items-center justify-center p-2 mb-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => setShowModal(true)}
          >
            <FiPlus className="mr-2" />
            Add Workspace
          </button>

          {currentWorkspace && (
            <>
              <button
                className="w-full flex items-center justify-center p-2 mb-3 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => generateInviteLink(currentWorkspace.id)}
              >
                <FiUsers className="mr-2" />
                Invite Members
              </button>

              <button
                className="w-full flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={showAddChannelModal}
              >
                <FiHash className="mr-2" />
                Add Channel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {currentWorkspace && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-white mr-3"
                style={{ backgroundColor: currentWorkspace.color }}
              >
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {currentWorkspace.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentWorkspace.members} member
                  {currentWorkspace.members !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-6 bg-gray-50 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600">Loading workspace data...</p>
            </div>
          ) : currentWorkspace ? (
            <div className="text-center">
              <FiGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                Welcome to {currentWorkspace.name}
              </h2>
              <p className="text-gray-500 max-w-md">
                This is your workspace. Content for this workspace will appear
                here.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <FiHome className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                No Workspace Selected
              </h2>
              <p className="text-gray-500">
                Please select a workspace from the sidebar or create a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create a Workspace</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter workspace name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-md cursor-pointer ${
                      workspaceColor === color
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setWorkspaceColor(color)}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              {/* Only show Cancel button if we have at least one workspace */}
              {workspaces.length > 0 && (
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleCreateWorkspace}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={workspaceName.trim() === ""}
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Invite Members</h2>
            <p className="text-gray-600 mb-4">
              Share this link with people you want to invite to{" "}
              <strong>{currentWorkspace?.name}</strong>
            </p>
            <div className="flex mb-4">
              <input
                type="text"
                value={currentWorkspace?.inviteLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none"
              />
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 flex items-center"
              >
                {copied ? (
                  <FiCheck className="mr-1" />
                ) : (
                  <FiCopy className="mr-1" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManagement;
