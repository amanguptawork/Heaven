import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { RiMessage3Line, RiSearchLine, RiRefreshLine } from "react-icons/ri";
import { useSocket } from "../../context/SocketContext";

const Messages = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    fetchConversations();

    if (socket) {
      socket.on("new_message", (message) => {
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.map((conv) => {
            if (conv._id.toString() === message.room_id.toString()) {
              return {
                ...conv,
                lastMessage: {
                  message: message.message,
                  timestamp: message.timestamp,
                },
                unreadCount: (conv.unreadCount || 0) + 1,
              };
            }
            return conv;
          });
          return updatedConversations;
        });
      });
      socket.on("unread_count_updated", ({ room_id, unreadCount }) => {
        setConversations(prev =>
          prev.map(conv =>
            conv._id === room_id
              ? { ...conv, unreadCount }
              : conv
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("new_message");
        socket.off("unread_count_updated");
      }
    };
  }, [socket]);


  // Add auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchConversations();
    setLoading(false);
  };

  // Safely filter by participant's name
  const filteredConversations = conversations.filter((conv) => {
    const participantName = conv?.participant?.fullName ?? "";
    return participantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), "p");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="p-6 bg-white border-b">
          <div className="mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-purple-50 rounded-full transition-all duration-200"
            >
              <RiRefreshLine
                className={`w-5 h-5 text-purple-600 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className=" mr-auto">
            <AnimatePresence>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <RiMessage3Line className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No conversations yet</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conv) => (
                    <motion.div
                      key={conv._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={() => navigate(`/chat/${conv._id}`)}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              conv?.participant?.photos?.[0] ||
                              "/default-avatar.png"
                            }
                            alt={
                              conv?.participant?.fullName ??
                              "Unknown participant"
                            }
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">
                              {conv?.participant?.fullName ??
                                "Unknown participant"}
                              {conv.block && (
                                <span className="text-xs text-red-500 ml-2">
                                  (Blocked)
                                </span>
                              )}
                            </h3>
                            {conv?.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatMessageTime(conv.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
