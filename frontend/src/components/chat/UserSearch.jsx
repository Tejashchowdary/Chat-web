import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, User, Plus } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import LoadingSpinner from "../common/LoadingSpinner";

const UserSearch = ({ onClose, onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { searchUsers, createChat, setCurrentChat } = useChatStore();

  useEffect(() => {
    const searchDebounced = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsLoading(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setIsLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [searchQuery, searchUsers]);

  const handleCreateChat = async (userId) => {
    const result = await createChat({
      participantId: userId,
      isGroupChat: false,
    });

    if (result.success) {
      setCurrentChat(result.chat);
      onUserSelect();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[80vh] sm:h-[70vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                New Chat
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm sm:text-base"
                autoFocus
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <motion.div
                    key={user._id}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 touch-button transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                          {user.username}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateChat(user._id)}
                      className="p-2 sm:p-3 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors touch-button flex-shrink-0"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">No users found</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">
                  Start typing to search for users
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserSearch;
