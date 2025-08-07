import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  senderName: string;
}

interface ChatBoxProps {
  orderId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  orderId, 
  currentUserId, 
  otherUserId, 
  otherUserName 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🔌 Initializing Socket.IO connection...');
    
    // Connect to Socket.IO with better configuration
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully');
      setIsConnected(true);
      setConnectionError(null);
      
      // Add user to online list
      newSocket.emit('addUser', currentUserId);
      
      // Join the order room
      newSocket.emit('joinOrder', { orderId, userId: currentUserId });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      setConnectionError('Failed to connect to chat server');
      setIsConnected(false);
    });

    // Message events
    newSocket.on('newMessage', (message: Message) => {
      console.log('📨 Received new message:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('messageSent', (data) => {
      console.log('✅ Message sent successfully:', data);
    });

    newSocket.on('roomJoined', (data) => {
      console.log('👥 Joined chat room:', data);
    });

    newSocket.on('connectionStatus', (data) => {
      console.log('🔗 Connection status:', data);
    });

    // Load existing messages
    loadMessages();

    return () => {
      console.log('🔌 Disconnecting Socket.IO...');
      newSocket.disconnect();
    };
  }, [orderId, currentUserId]);

  const loadMessages = async () => {
    try {
      console.log('📥 Loading messages for order:', orderId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Loaded messages:', data);
      
      if (data.success) {
        setMessages(data.messages);
      } else {
        console.error('Failed to load messages:', data.message);
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      setConnectionError('Failed to load message history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) {
      console.log('❌ Cannot send message: empty message or no socket');
      return;
    }

    const messageData = {
      senderId: currentUserId,
      receiverId: otherUserId,
      content: newMessage.trim(),
      orderId
    };

    console.log('📤 Sending message:', messageData);

    try {
      // Send via socket for real-time delivery
      socket.emit('sendMessage', messageData);

      // Send via API for persistence
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        console.log('✅ Message saved to database');
        setNewMessage('');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save message to database:', errorData);
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Emit typing indicator
    if (socket && e.target.value.length > 0) {
      socket.emit('typing', { orderId, userId: currentUserId, isTyping: true });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{otherUserName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isConnected ? '🟢 Online' : '⚪ Offline'}
            </p>
            {connectionError && (
              <p className="text-xs text-red-500 mt-1">{connectionError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  message.senderId === currentUserId
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
        <div className="flex items-center space-x-3">
          <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all duration-200"
              rows={2}
              disabled={!isConnected}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">⚠️ Not connected to chat server</p>
        )}
      </div>
    </div>
  );
};

export default ChatBox; 