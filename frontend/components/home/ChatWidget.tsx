
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  isBot: boolean;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Chào bạn! Chúng tôi có thể giúp gì cho bạn?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Cảm ơn bạn! Tư vấn viên sẽ liên hệ lại trong thời gian sớm nhất.", 
        isBot: true 
      }]);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 bottom-6 w-14 h-14 bg-[#0093E9] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 hover:scale-110 transition-transform"
      >
        <i className={isOpen ? "fas fa-times" : "fas fa-comment-dots"}></i>
      </button>

      {isOpen && (
        <div className="fixed right-6 bottom-24 w-80 md:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-fade-in-up border border-gray-100">
          <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">TV</div>
              <div>
                <h4 className="font-bold text-sm">Hỗ trợ trực tuyến</h4>
                <p className="text-[10px] text-gray-400">Bệnh viện Ánh Dương</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <i className="fas fa-minus"></i>
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.isBot 
                    ? 'bg-white text-gray-800 rounded-bl-none shadow-sm' 
                    : 'bg-[#0093E9] text-white rounded-br-none shadow-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-top flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..." 
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button type="submit" className="text-[#0093E9] text-xl px-2">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
