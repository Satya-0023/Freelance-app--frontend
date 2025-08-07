import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import type { Message, Order } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const OrderMessages: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const socket = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrderAndMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const orderRes = await apiService.getOrderById(orderId!);
        const order: Order = orderRes.data;
        // Determine the other user in the order
        let otherId = null;
        if (user && order) {
          if (user.id === order.buyer?._id) {
            otherId = order.seller?._id;
          } else {
            otherId = order.buyer?._id;
          }
          setOtherUserId(otherId);
          const msgRes = await apiService.getMessages(otherId);
          setMessages(msgRes.data || []);
        }
      } catch (err) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    if (orderId && user) fetchOrderAndMessages();
  }, [orderId, user]);

  useEffect(() => {
    socket.current = io('http://localhost:5000');
    if (otherUserId) {
      socket.current.emit('joinUserRoom', otherUserId);
    }
    socket.current.on('receiveMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.current?.disconnect();
    };
  }, [otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !otherUserId) return;
    try {
      await apiService.sendMessage({ receiverId: otherUserId, content: input });
      setMessages(prev => [...prev, { id: Date.now().toString(), senderId: user?.id, content: input, createdAt: new Date().toISOString() } as Message]);
      socket.current.emit('sendMessage', { senderId: user?.id, receiverId: otherUserId, text: input });
      setInput('');
    } catch {
      setError('Failed to send message');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading chat...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-xl font-bold mb-4">Order Chat</h2>
      <div className="border rounded p-4 h-96 overflow-y-auto bg-gray-50 mb-4">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center">No messages yet.</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="mb-2">
              <span className="font-semibold">{msg.senderId === user?.id ? 'You' : 'Them'}</span>: {msg.content}
              <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
      </form>
    </div>
  );
};

export default OrderMessages; 