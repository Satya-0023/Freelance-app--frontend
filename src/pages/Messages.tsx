import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Search, MoreVertical, User, Plus, MessageCircle, Activity } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast, safeShowToast } from '../utils/toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  senderName: string;
}

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: string;
  }>;
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
}

interface Freelancer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface OnlineChartData {
  timestamp: Date;
  bothOnline: boolean;
  user1Online: boolean;
  user2Online: boolean;
}

const Messages: React.FC = () => {
  // Test if useAuth hook is working
  let authHook = null;
  try {
    authHook = useAuth();
    console.log('Messages: useAuth hook working:', authHook);
  } catch (error: any) {
    console.error('Messages: useAuth hook error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">useAuth hook is not working: {error?.message || 'Unknown error'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, loading: authLoading } = authHook;
  console.log('Messages: useAuth hook result:', { user, authLoading });
  

  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [availableFreelancers, setAvailableFreelancers] = useState<Freelancer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatus[]>([]);
  const [onlineChartData, setOnlineChartData] = useState<OnlineChartData[]>([]);
  const [showOnlineChart, setShowOnlineChart] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Messages component mounted. User:', user);
    if (user) {
      fetchConversations();
      fetchAvailableFreelancers();
      initializeSocket();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      updateOnlineChartData();
    }
  }, [selectedConversation, onlineUsers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update online chart data when online users change
  useEffect(() => {
    if (selectedConversation) {
      const wasBothOnline = onlineChartData.length > 0 && onlineChartData[onlineChartData.length - 1]?.bothOnline;
      updateOnlineChartData();
      
      // Check if both users just came online
      const user1 = selectedConversation.participants[0];
      const user2 = selectedConversation.participants[1];
      const user1Online = isUserOnline(user1.id);
      const user2Online = isUserOnline(user2.id);
      const isBothOnline = user1Online && user2Online;
      
             if (isBothOnline && !wasBothOnline) {
         showSuccessToast('Both Online!', 'Both users are now online! 🎉');
       }
    }
  }, [onlineUsers, selectedConversation]);

  // Periodic update of online chart data
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      updateOnlineChartData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const initializeSocket = () => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to socket server');
      
      // Add user to online list
      if (user?.id) {
        newSocket.emit('addUser', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket server');
    });

         newSocket.on('getMessage', (data) => {
       if (selectedConversation && 
           (data.senderId === selectedConversation.participants[0].id || 
            data.senderId === selectedConversation.participants[1].id)) {
         setMessages(prev => [...prev, {
           id: Date.now().toString(),
           senderId: data.senderId,
           receiverId: data.receiverId,
           content: data.text,
           timestamp: new Date(data.timestamp || Date.now()),
           senderName: data.senderName || data.senderFirstName || data.senderFullName || 'Unknown'
         }]);
       }
     });

         newSocket.on('newMessage', (data) => {
       if (selectedConversation && 
           (data.senderId === selectedConversation.participants[0].id || 
            data.senderId === selectedConversation.participants[1].id)) {
         setMessages(prev => [...prev, {
           id: Date.now().toString(),
           senderId: data.senderId,
           receiverId: data.receiverId,
           content: data.text,
           timestamp: new Date(data.timestamp || Date.now()),
           senderName: data.senderName || data.senderFirstName || data.senderFullName || 'Unknown'
         }]);
       }
     });

    // Online status events
    newSocket.on('userOnline', (userId: string) => {
      setOnlineUsers(prev => {
        const existing = prev.find(u => u.userId === userId);
        if (existing) {
          return prev.map(u => u.userId === userId ? { ...u, isOnline: true } : u);
        } else {
          return [...prev, { userId, isOnline: true }];
        }
      });
    });

    newSocket.on('userOffline', (userId: string) => {
      setOnlineUsers(prev => 
        prev.map(u => u.userId === userId ? { ...u, isOnline: false, lastSeen: new Date() } : u)
      );
    });

    newSocket.on('onlineUsers', (users: string[]) => {
      const onlineStatuses: OnlineStatus[] = users.map(userId => ({
        userId,
        isOnline: true
      }));
      setOnlineUsers(onlineStatuses);
    });

    return () => {
      newSocket.close();
    };
  };

  const updateOnlineChartData = () => {
    if (!selectedConversation) return;

    const user1 = selectedConversation.participants[0];
    const user2 = selectedConversation.participants[1];
    
    const user1Online = onlineUsers.find(u => u.userId === user1.id)?.isOnline || false;
    const user2Online = onlineUsers.find(u => u.userId === user2.id)?.isOnline || false;
    const bothOnline = user1Online && user2Online;

    const newDataPoint: OnlineChartData = {
      timestamp: new Date(),
      bothOnline,
      user1Online,
      user2Online
    };

    setOnlineChartData(prev => {
      const updated = [...prev, newDataPoint];
      // Keep only last 50 data points to prevent memory issues
      return updated.slice(-50);
    });
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.find(u => u.userId === userId)?.isOnline || false;
  };

  const getOnlineStatusText = (conversation: Conversation) => {
    if (!conversation) return '';
    
    const otherUser = conversation.participants.find(p => p.id !== user?.id);
    if (!otherUser) return '';
    
    const isOnline = isUserOnline(otherUser.id);
    return isOnline ? '🟢 Online' : '⚪ Offline';
  };

  const renderOnlineChart = () => {
    if (!selectedConversation || onlineChartData.length === 0) return null;

    const user1 = selectedConversation.participants[0];
    const user2 = selectedConversation.participants[1];
    const user1Name = user1.firstName || user1.username;
    const user2Name = user2.firstName || user2.username;

    // Calculate statistics
    const totalPoints = onlineChartData.length;
    const bothOnlineCount = onlineChartData.filter(d => d.bothOnline).length;
    const bothOnlinePercentage = totalPoints > 0 ? (bothOnlineCount / totalPoints) * 100 : 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Online Status Chart
          </h3>
          <button
            onClick={() => setShowOnlineChart(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {bothOnlinePercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Both Online</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {onlineChartData.filter(d => d.user1Online).length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">{user1Name} Online</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {onlineChartData.filter(d => d.user2Online).length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">{user2Name} Online</div>
          </div>
        </div>

        {/* Simple Chart Visualization */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recent Activity (Last {onlineChartData.length} data points)
          </div>
          <div className="flex space-x-1 h-8">
            {onlineChartData.slice(-20).map((data, index) => (
              <div
                key={index}
                className={`flex-1 rounded-sm ${
                  data.bothOnline 
                    ? 'bg-green-500' 
                    : data.user1Online || data.user2Online 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                title={`${new Date(data.timestamp).toLocaleTimeString()}: ${
                  data.bothOnline ? 'Both Online' : 
                  data.user1Online || data.user2Online ? 'One Online' : 'Both Offline'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>🟢 Both Online</span>
            <span>🟡 One Online</span>
            <span>⚪ Both Offline</span>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Status
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isUserOnline(user1.id) ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{user1Name}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isUserOnline(user2.id) ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{user2Name}</span>
            </div>
          </div>
          
          {/* Both Online Indicator */}
          {isUserOnline(user1.id) && isUserOnline(user2.id) && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Both users are online! 🎉
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getConversations();
      if (response.success) {
        setConversations(response.data || []);
             } else {
         setError(response.message || 'Failed to load conversations');
         safeShowToast('error', 'Error', response.message || 'Failed to load conversations');
       }
     } catch (err: any) {
       setError(err.message || 'Failed to load conversations');
       safeShowToast('error', 'Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFreelancers = async () => {
    try {
      const response = await apiService.getFreelancers();
      console.log('Freelancers API response:', response);
      
      if (response.success) {
        console.log('Setting freelancers:', response.data);
        setAvailableFreelancers(response.data || []);
             } else {
         console.error('Failed to fetch freelancers:', response.message);
         safeShowToast('error', 'Error', 'Failed to load freelancers. Using demo data.');
        // Fallback to mock data if API fails
        const mockFreelancers: Freelancer[] = [
          {
            id: '1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@example.com',
            role: 'freelancer',
            avatar: undefined
          },
          {
            id: '2',
            firstName: 'Mike',
            lastName: 'Chen',
            email: 'mike@example.com',
            role: 'freelancer',
            avatar: undefined
          },
          {
            id: '3',
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma@example.com',
            role: 'freelancer',
            avatar: undefined
          },
          {
            id: '4',
            firstName: 'Chris',
            lastName: 'Davis',
            email: 'chris@example.com',
            role: 'freelancer',
            avatar: undefined
          }
        ];
        setAvailableFreelancers(mockFreelancers);
      }
         } catch (err: any) {
       console.error('Failed to fetch freelancers:', err);
       safeShowToast('error', 'Error', 'Failed to load freelancers. Using demo data.');
      // Fallback to mock data
      const mockFreelancers: Freelancer[] = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@example.com',
          role: 'freelancer',
          avatar: undefined
        },
        {
          id: '2',
          firstName: 'Mike',
          lastName: 'Chen',
          email: 'mike@example.com',
          role: 'freelancer',
          avatar: undefined
        },
        {
          id: '3',
          firstName: 'Emma',
          lastName: 'Wilson',
          email: 'emma@example.com',
          role: 'freelancer',
          avatar: undefined
        },
        {
          id: '4',
          firstName: 'Chris',
          lastName: 'Davis',
          email: 'chris@example.com',
          role: 'freelancer',
          avatar: undefined
        }
      ];
      setAvailableFreelancers(mockFreelancers);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await apiService.getMessagesByConversation(conversationId);
      if (response.success) {
                 const formattedMessages = response.data.map((msg: any) => {
           // Always show the actual sender's name (full name)
           const senderName = msg.sender.profile?.firstName && msg.sender.profile?.lastName 
             ? `${msg.sender.profile.firstName} ${msg.sender.profile.lastName}`
             : msg.sender.profile?.firstName || msg.sender.username;
           
           return {
             id: msg._id,
             senderId: msg.sender._id,
             receiverId: msg.receiver._id,
             content: msg.content,
             timestamp: new Date(msg.createdAt),
             senderName
           };
         });
        setMessages(formattedMessages);
             } else {
         setError(response.message || 'Failed to load messages');
         safeShowToast('error', 'Error', response.message || 'Failed to load messages');
       }
     } catch (err: any) {
       setError(err.message || 'Failed to load messages');
       safeShowToast('error', 'Error', 'Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socket) {
      return;
    }

    try {
      const receiverId = selectedConversation.participants.find(
        p => p.id !== user?.id
      )?.id;

             if (!receiverId) {
         safeShowToast('error', 'Error', 'Invalid conversation');
         return;
       }

      const messageData = {
        senderId: user?.id,
        receiverId,
        text: newMessage.trim()
      };

      // Send via socket first for real-time delivery
      socket.emit('sendMessage', messageData);

      // Send via API for persistence
      const response = await apiService.sendMessage({
        receiverId,
        content: newMessage.trim()
      });

             if (response.success) {
         // Add to local state
         const newMsg: Message = {
           id: response.data._id || Date.now().toString(),
           senderId: user?.id || '',
           receiverId,
           content: newMessage.trim(),
           timestamp: new Date(),
           senderName: user?.firstName && user?.lastName 
             ? `${user.firstName} ${user.lastName}`
             : user?.firstName || user?.username || 'You'
         };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        
                 // Refresh conversations to update last message
         await fetchConversations();
         safeShowToast('success', 'Success', 'Message sent!');
       } else {
         safeShowToast('error', 'Error', response.message || 'Failed to send message');
       }
     } catch (err: any) {
       setError(err.message || 'Failed to send message');
       safeShowToast('error', 'Error', 'Failed to send message');
    }
  };

  const startNewConversation = async (freelancerId: string) => {
    if (isStartingConversation) return; // Prevent multiple clicks
    
    try {
      setIsStartingConversation(true);
      
             // Check if user is authenticated
       if (!user?.id) {
         console.error('User not authenticated');
         safeShowToast('error', 'Error', 'Please log in to start a conversation');
         return;
       }

       const freelancer = availableFreelancers.find(f => f.id === freelancerId);
       if (!freelancer) {
         console.error('Freelancer not found:', { freelancerId, availableFreelancers });
         safeShowToast('error', 'Error', 'Freelancer not found');
         return;
       }

      console.log('Starting conversation with freelancer:', freelancer);
      console.log('Current user:', user);

      // Create a proper conversation ID that matches backend format
      const conversationId = [user.id, freelancerId].sort().join('_');

      // Create a new conversation
      const conversation: Conversation = {
        id: conversationId, // Use proper conversation ID
        participants: [
          {
            id: user.id,
            username: user.email || '',
            firstName: user.firstName || user.username || 'User',
            lastName: user.lastName || '',
            role: user.role || 'user'
          },
          {
            id: freelancerId,
            username: freelancer.email,
            firstName: freelancer.firstName,
            lastName: freelancer.lastName,
            role: 'freelancer'
          }
        ],
        lastMessage: {
          content: '',
          timestamp: new Date(),
          senderId: ''
        },
        unreadCount: 0
      };

      console.log('Created conversation:', conversation);

             setConversations(prev => [conversation, ...prev]);
       setSelectedConversation(conversation);
       setShowNewConversation(false);
       safeShowToast('success', 'Success', `Started conversation with ${freelancer.firstName} ${freelancer.lastName}!`);
     } catch (err: any) {
       console.error('Error starting conversation:', err);
       safeShowToast('error', 'Error', 'Failed to start conversation');
    } finally {
      setIsStartingConversation(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      (p.firstName + ' ' + p.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading messages...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Please log in to access messages</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto" data-testid="messages-container">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-[700px] flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-1/3 bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
                  <div className="flex items-center space-x-2">
                                         <button
                                               onClick={() => {
                          console.log('Current user:', user);
                          console.log('Token:', localStorage.getItem('token'));
                          console.log('Auth loading state:', authLoading);
                          console.log('Component loading state:', loading);
                          
                          // Test authentication manually
                          const token = localStorage.getItem('token');
                          if (token) {
                                                         apiService.getMe(token).then(res => {
                               console.log('Manual auth test:', res);
                               safeShowToast('info', 'Debug', `User: ${user?.email || 'Not logged in'} | Auth Loading: ${authLoading} | Auth: ${res.success ? 'Valid' : 'Invalid'}`);
                             }).catch(err => {
                               console.log('Manual auth error:', err);
                               safeShowToast('error', 'Debug', 'Authentication failed');
                             });
                           } else {
                             safeShowToast('info', 'Debug', `User: ${user?.email || 'Not logged in'} | Auth Loading: ${authLoading} | No Token`);
                           }
                        }}
                       className="p-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                       title="Debug info"
                     >
                       Debug
                     </button>
                    <button
                      onClick={() => setShowNewConversation(true)}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                      title="Start new conversation"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                />
              </div>
            </div>

            {/* New Conversation Modal */}
            {showNewConversation && (
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Start New Conversation</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableFreelancers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No freelancers available</p>
                  ) : (
                    availableFreelancers.map(freelancer => (
                      <button
                        key={freelancer.id}
                        onClick={() => {
                          console.log('Clicked freelancer:', freelancer);
                          startNewConversation(freelancer.id);
                        }}
                        disabled={isStartingConversation}
                        className="w-full p-3 text-left bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 active:bg-blue-100 dark:active:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-md">
                            {isStartingConversation ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              freelancer.firstName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white block">
                              {freelancer.firstName} {freelancer.lastName}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-300 block">
                              {freelancer.email}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="mt-3 w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="font-medium">No conversations yet</p>
                  <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">Click the + button to start a conversation</p>
                </div>
              ) : (
                filteredConversations.map(conversation => {
                  const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 ${
                        selectedConversation?.id === conversation.id ? 'bg-white dark:bg-gray-800 shadow-sm border-l-4 border-l-blue-500' : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-md">
                            <span className="text-sm font-bold">
                              {otherParticipant?.firstName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          {/* Online status indicator */}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                            isUserOnline(otherParticipant?.id || '') ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {otherParticipant?.firstName} {otherParticipant?.lastName}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(conversation.lastMessage?.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-sm font-bold">
                          {selectedConversation.participants.find(p => p.id !== user?.id)?.firstName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      {/* Online status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        isUserOnline(selectedConversation.participants.find(p => p.id !== user?.id)?.id || '') ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedConversation.participants.find(p => p.id !== user?.id)?.firstName} {selectedConversation.participants.find(p => p.id !== user?.id)?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getOnlineStatusText(selectedConversation)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowOnlineChart(!showOnlineChart)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Show online status chart"
                    >
                      <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Online Chart */}
                {showOnlineChart && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    {renderOnlineChart()}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium mb-2">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(message => {
                      const isOwnMessage = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                            }`}
                                                     >
                             {/* Show sender name for all messages */}
                             <p className={`text-xs mb-1 ${
                               isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                             }`}>
                               {message.senderName}
                             </p>
                             <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-2 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                      <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="h-20 w-20 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                  <p className="text-xl font-semibold mb-3">Select a conversation</p>
                  <p className="text-sm">Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 