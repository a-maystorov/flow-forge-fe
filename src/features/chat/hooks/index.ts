// Only export the query-based hooks for fetching chats
// Socket-based operations (chat creation and messages) are now handled in SocketContext
export { useChats } from './useChats';
export { useChat } from './useChat';
