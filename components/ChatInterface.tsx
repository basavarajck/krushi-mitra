import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FarmerProfile, ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { SendIcon, UploadIcon, BotIcon, UserIcon, MicrophoneIcon } from './icons/Icons';

interface ChatInterfaceProps {
  profile: FarmerProfile;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: `Namaste, ${profile.name}! I am your Krishi Mitra AI. How can I help you with your ${profile.mainCrop} crop today? Ask me about weather, pests, or market prices.` }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState('en-IN'); // en-IN for English, kn-IN for Kannada
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // Setup Web Speech API
  useEffect(() => {
    // FIX: Cast window to `any` to access non-standard SpeechRecognition properties.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = recognitionLang;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    };

    recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map(result => result.transcript)
            .join('');
        setUserInput(transcript);
        if (event.results[0].isFinal) {
             recognition.stop();
        }
    };
    
    recognitionRef.current = recognition;
  }, [recognitionLang]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const preview = URL.createObjectURL(file);
      setImage({ file, preview });
    }
  };

  const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
  };

  const handleSend = useCallback(async () => {
    if (!userInput.trim() && !image) return;

    const userMessageContent = userInput.trim();
    const userMessage: ChatMessage = { role: 'user', content: userMessageContent };
    if (image) {
        userMessage.image = image.preview;
    }

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const currentImage = image; // Capture current image
    setImage(null); // Clear image preview after sending

    try {
        let imagePayload;
        if (currentImage) {
            imagePayload = await fileToBase64(currentImage.file);
        }

        const history = messages.filter(m => m.role !== 'system');
        const modelResponse = await generateChatResponse(profile, history, userMessageContent, imagePayload);
        
        setMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => [...prev, { role: 'model', content: "An error occurred. Please try again." }]);
    } finally {
        setIsLoading(false);
    }
  }, [userInput, image, messages, profile]);
  
  const handleQuickAction = (prompt: string) => {
    setUserInput(prompt);
  };
  
  const quickActions = [
    "Today's key advice",
    `Check for pests on my ${profile.mainCrop}`,
    `Market price trend for ${profile.mainCrop}?`,
    "Remind me about crop rotation"
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <BotIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />}
            <div className={`w-full max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-green-100 dark:bg-green-900/50 rounded-br-none' : 'bg-gray-100 dark:bg-gray-700/50 rounded-bl-none'}`}>
              {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-h-48 w-auto" />}
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{msg.content}</p>
            </div>
             {msg.role === 'user' && <UserIcon className="h-8 w-8 text-gray-500 flex-shrink-0 mt-1" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
            <BotIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
            <div className="w-full max-w-xl p-4 rounded-2xl bg-gray-100 dark:bg-gray-700/50 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
                </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map(action => (
                <button key={action} onClick={() => handleQuickAction(action)} className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                    {action}
                </button>
            ))}
        </div>
        {image && (
          <div className="mb-2 flex items-center gap-2">
            <img src={image.preview} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
            <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">{image.file.name}</span>
            <button onClick={() => setImage(null)} className="text-red-500 font-bold">X</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Upload Image">
            <UploadIcon className="h-6 w-6" />
          </button>
          <div className="flex-1 relative">
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder={isListening ? 'Listening...' : "Type your message or upload an image..."}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 pr-24"
                disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <div className="flex items-center bg-gray-200 dark:bg-gray-600 rounded-full p-0.5">
                    <button onClick={() => setRecognitionLang('en-IN')} className={`px-2 py-0.5 text-xs rounded-full ${recognitionLang === 'en-IN' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}>EN</button>
                    <button onClick={() => setRecognitionLang('kn-IN')} className={`px-2 py-0.5 text-xs rounded-full ${recognitionLang === 'kn-IN' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}>ಕ</button>
                </div>
                <button onClick={toggleListen} className={`p-2 ml-1 rounded-full ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'}`} aria-label="Toggle Voice Input">
                    <MicrophoneIcon className="h-6 w-6" />
                </button>
            </div>
          </div>
          <button onClick={handleSend} disabled={isLoading || (!userInput.trim() && !image)} className="p-2 text-white bg-green-600 rounded-full hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed">
            <SendIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;