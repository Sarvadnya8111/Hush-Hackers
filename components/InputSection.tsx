import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, Mic, MicOff, Plus, X, Image as ImageIcon } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (text: string, image?: { data: string; mimeType: string }) => void;
  isLoading: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const textRef = useRef(text);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Voice input is not supported.");
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      const startText = textRef.current;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
        const spacer = startText && startText.trim().length > 0 ? ' ' : '';
        setText(startText + spacer + transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setSelectedImage({ mimeType: file.type, data: base64Data, preview: result });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() || selectedImage) {
      onAnalyze(text, selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined);
    }
  };

  const hasContent = text.trim().length > 0 || selectedImage !== null;

  return (
    <div className="bg-white dark:bg-[#0A0A0B] rounded-[28px] overflow-hidden transition-colors duration-300">
      {isListening && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 animate-shimmer" />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <textarea
          className={`w-full min-h-[140px] bg-transparent text-lg md:text-xl text-slate-800 dark:text-slate-200 p-6 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none resize-none transition-opacity font-light ${isListening ? 'opacity-50' : 'opacity-100'}`}
          placeholder={isListening ? "Listening..." : "Paste suspicious text, emails, or upload a screenshot..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading || isListening}
        />
        
        {selectedImage && (
          <div className="px-6 pb-2">
            <div className="relative inline-block group">
              <img 
                src={selectedImage.preview} 
                alt="Upload Preview" 
                className="h-20 w-auto rounded-xl border border-slate-200 dark:border-white/10 shadow-lg object-cover" 
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-slate-500 hover:text-rose-500 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center px-4 pb-4 gap-3 mt-auto">
            <div className="flex items-center gap-2 w-full md:w-auto">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} disabled={isLoading} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading}
                    className={`p-3 rounded-xl transition-colors ${isListening ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden md:block" />
                
                <span className="text-xs text-slate-400 font-medium hidden md:block">
                   {text.length} characters
                </span>
            </div>

            <button
            type="submit"
            disabled={!hasContent || isLoading}
            className={`
                w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all
                ${!hasContent || isLoading
                ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-xl shadow-slate-900/10 dark:shadow-white/5'
                }
            `}
            >
            {isLoading ? (
                <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing
                </>
            ) : (
                <>
                Analyze Threat
                <ArrowRight className="w-4 h-4" />
                </>
            )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default InputSection;