import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { RiSendPlaneFill } from "react-icons/ri";
import { useParams, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import BlockUserModal from "../../components/BlockUserModal";
import useUserProfileStore from "../../store/user";
import SubscriptionModal from "../../components/Subscription/SubscriptionModal";

const Chat = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const socket = useSocket();
  const { userProfile } = useUserProfileStore();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [chatPartner, setChatPartner] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [chatAnimationData, setChatAnimationData] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const chatPartnerRef = useRef(chatPartner);

  useEffect(() => {
    fetch(`${API_URL}/chat/markAsRead`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ roomId }),
    }).catch((err) => console.error("markAsRead failed", err));
  }, [room, API_URL]);

  useEffect(() => {
    chatPartnerRef.current = chatPartner;
  }, [chatPartner]);

  useEffect(() => {
    const handleUserOnline = (data) => {
      if (data.userId === chatPartnerRef.current?.id) {
        setChatPartner((prev) => ({ ...prev, online: true }));
      }
    };

    const handleUserOffline = (data) => {
      if (data.userId === chatPartnerRef.current?.id) {
        setChatPartner((prev) => ({ ...prev, online: false }));
      }
    };

    socket?.on("user_online", handleUserOnline);
    socket?.on("user_offline", handleUserOffline);

    return () => {
      socket?.off("user_online", handleUserOnline);
      socket?.off("user_offline", handleUserOffline);
    };
  }, [socket]);

  // Dynamically fetch the .lottie file from /public on mount
  useEffect(() => {
    fetch("/chat.json")
      .then((res) => res.json())
      .then((data) => setChatAnimationData(data))
      .catch((err) => console.error("Error fetching Lottie file:", err));
  }, []);

  // Ensure we always scroll to the bottom of chat messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat partner details by hitting /profile/:id
  const fetchChatPartnerDetails = async (participantId) => {
    const res = await fetch(`${API_URL}/profile/${participantId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });
    const { data: userData } = await res.json();

    // Consider “online” if they were active in the last 60 seconds
    const online = userData.isOnline
      ? Date.now() - new Date(userData.lastActive).getTime() < 60_000
      : false;

    setChatPartner({
      id: userData._id,
      name: userData.fullName,
      photo: userData.photos?.[0] || "/default-avatar.png",
      online,
      subscriptionStatus: userData.subscriptionStatus,
    });
  };

  const handleBlockUser = async (reason) => {
    try {
      const response = await fetch(`${API_URL}/chat/block-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockedUserId: chatPartner.id,
          roomId: room,
          reason,
          adminEmails: ["peter.okachie@gmail.com", "drewinner@exmstaffing.com"],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to block user");
      }
      navigate("/messages");
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  // ─────────────────────────────────────────
  // NEW: Check if current user is blocked or has blocked the chat partner
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!chatPartner?.id || !userProfile?._id) return;

    const checkBlockStatus = async () => {
      try {
        const res = await fetch(
          `${API_URL}/chat/is-blocked?userId=${userProfile._id}&blockedUserId=${chatPartner.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to check block status");
        }
        const data = await res.json();
        // Expecting { success: true, isBlocked: boolean }
        setIsBlocked(data.isBlocked);
      } catch (err) {
        console.error("Error checking block status:", err);
      }
    };

    checkBlockStatus();
  }, [chatPartner, userProfile, API_URL]);

  // Fetch room participants from the server and initialize the chat
  const fetchRoomData = async (theRoomId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/chat/room/${theRoomId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch room data");
      }

      const data = await response.json();
      // Identify the "other" participant
      const otherParticipant = data.participants.find(
        (p) => p !== userProfile._id
      );

      if (!otherParticipant || !userProfile._id) {
        setError("Invalid participant data");
        setIsConnecting(false);
        return;
      }

      // If everything is valid, initialize the chat
      initializeChat(theRoomId, otherParticipant);
    } catch (err) {
      console.error("Error fetching room data:", err);
      setError("Failed to load chat data");
      setIsConnecting(false);
    }
  };

  // Join the socket room, fetch chat partner info
  const initializeChat = (theRoomId, participantId) => {
    setIsConnecting(false);
    setRoom(theRoomId);

    // Tell the server we want to join a specific room
    socket.emit("join_chat", {
      room_id: theRoomId,
      participant_1: userProfile._id,
      participant_2: participantId,
      timestamp: new Date().toISOString(),
    });

    // Also fetch the partner's data for the chat header
    fetchChatPartnerDetails(participantId);
  };

  // Send a message via socket.io
  const sendMessage = (e) => {
    e?.preventDefault();
    if (!input.trim() || !room) return;
    setError(null);
    const tempId = Date.now().toString();

    const tempMessage = {
      _id: tempId,
      sender_id: userProfile._id,
      message: input.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();

    const messageData = {
      tempId,
      sender_id: userProfile._id,
      message: input.trim(),
      room_id: room,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", messageData, (response) => {
      if (!response.success) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));

        if (response.code === "FREE_CAP_REACHED") {
          setShowSubscriptionModal(true);
          return;
        } else {
          setError(response.message || "Failed to send message");
        }
      }
    });

    setInput("");
    scrollToBottom();
  };

  // Main effect to set up everything
  useEffect(() => {
    setMessages([]);
    setError(null);
    setIsConnecting(true);
    if (!socket) {
      setError("Socket not available");
      setIsConnecting(false);
      return;
    }

    if (!userProfile?._id) {
      setError("User not found. Please log in.");
      setIsConnecting(false);
      return;
    }

    if (roomId) {
      fetchRoomData(roomId);
    } else {
      setError("No room specified");
      setIsConnecting(false);
    }

    socket.on("joined_chat", (response) => {
      setRoom(response.room);
      setIsConnecting(false);
      setError(null);

      socket.emit("get_message_history", {
        room_id: response.room,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("message_history", (data) => {
      const msgs = Array.isArray(data.messages) ? data.messages : [];
      setMessages(msgs);
      scrollToBottom();
      if (
        userProfile.subscriptionStatus === "free" &&
        chatPartner &&
        chatPartner.subscriptionStatus === "premium"
      ) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const receivedCount = msgs.filter((msg) => {
          return (
            msg.sender_id === chatPartner.id &&
            new Date(msg.timestamp) >= startOfDay
          );
        }).length;
        if (receivedCount >= 10) {
          setError(
            "You have reached the daily limit of messages from premium users."
          );
        }
      }
    });

    socket.on("new_message", (incomingMsg) => {
      setMessages((prev) => {
        if (incomingMsg.tempId) {
          const alreadyExists = prev.some(
            (m) => m._id === incomingMsg.tempId || m._id === incomingMsg._id
          );
          if (alreadyExists) {
            return prev;
          }
        }

        return [...prev, incomingMsg];
      });

      scrollToBottom();
      fetch(`${API_URL}/chat/markAsRead`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ roomId: roomId }),
      }).catch(console.error);
    });

    socket.on("error", (socketError) => {
      if (socketError.message) {
        setError(socketError.message);
      }
      setIsConnecting(false);
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Cleanup
    return () => {
      socket.off("joined_chat");
      socket.off("new_message");
      socket.off("error");
      socket.off("message_history");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket, userProfile, roomId]);

  if (!socket) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Main Chat Area */}

      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex-none py-5 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-start md:items-center gap-4 w-full">
            <div
              className="w-16 h-16  rounded-full overflow-hidden"
              onClick={() => navigate(`/user-profile/${chatPartner?.id}`)}
            >
              <img
                src={chatPartner?.photo || "/default-avatar.png"}
                alt={chatPartner?.name || "Loading..."}
                className="w-full h-full object-cover cursor-pointer"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
            </div>
            <div className="w-full flex justify-between flex-col md:flex-row flex-1 gap-2">
              <div>
                <h2
                  className="text-lg font-semibold text-gray-900 cursor-pointer"
                  onClick={() => navigate(`/user-profile/${chatPartner?.id}`)}
                >
                  {chatPartner?.name || "Loading..."}
                </h2>
                {chatPartner?.online ? (
                  <span className="text-sm text-green-500">Online</span>
                ) : (
                  <span className="text-sm text-red-500">Offline</span>
                )}
              </div>
              {!isBlocked ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowBlockModal(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md"
                  >
                    Block User
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {isBlocked && (
          <div className="flex-none bg-red-100 text-red-700 p-2 text-center mb-2">
            You have blocked this user or have been blocked. You cannot send
            messages.
          </div>
        )}

        {/* Error and Connection Status */}
        {error && (
          <div className="flex-none bg-red-100 text-red-700 p-3 text-center">
            {error}
          </div>
        )}
        {isConnecting && (
          <div className="flex-none bg-blue-100 text-blue-700 p-3 text-center">
            Connecting to chat...
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 mb-20 md:mb-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-64 h-64 mb-2">
                {chatAnimationData && (
                  <Lottie animationData={chatAnimationData} loop={true} />
                )}
              </div>
              <p className="font-fraunces text-center text-gray-500 text-lg font-semibold">
                Don’t Keep Your Match Waiting, Send A Message Now
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${
                  msg.sender_id === userProfile._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.sender_id !== userProfile._id && (
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden mr-2"
                    onClick={() => navigate(`/user-profile/${chatPartner?.id}`)}
                  >
                    <img
                      src={chatPartner?.photo || "/default-avatar.png"}
                      alt={chatPartner?.name || "Partner Avatar"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </div>
                )}
                <div
                  className={`max-w-[60%] p-4 rounded-2xl ${
                    msg.sender_id === userProfile._id
                      ? "bg-purple-500 text-white rounded-br-none"
                      : "bg-white shadow-sm rounded-bl-none"
                  }`}
                >
                  <p className="break-words text-[15px]">{msg.message}</p>
                  <span
                    className={`text-xs ${
                      msg.sender_id === userProfile._id
                        ? "text-purple-100"
                        : "text-gray-400"
                    } block mt-1`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {msg.sender_id === userProfile._id && (
                  <div className="w-8 h-8 rounded-full overflow-hidden ml-2">
                    <img
                      src={userProfile?.photos?.[0] || "/default-avatar.png"}
                      alt={userProfile?.fullName || "My Avatar"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={sendMessage}
          className="flex-none fixed md:static bottom-0 w-full p-4 bg-white border-t border-gray-200"
        >
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-4 border border-gray-200 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              disabled={!room || isConnecting || isBlocked}
            />
            <button
              type="submit"
              disabled={!input.trim() || !room || isConnecting || isBlocked}
              className="bg-purple-500 text-white p-4 rounded-full hover:bg-purple-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <RiSendPlaneFill className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockUser}
        userName={chatPartner?.name}
      />
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[9999]">
          <SubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Chat;
