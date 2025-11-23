import React, { useState, useCallback, useRef, useEffect } from 'react';
import Controls from './components/Controls';
import ImageCard from './components/ImageCard';
import { MagicWandIcon, SparklesIcon, PlusIcon, PhotoIcon, CameraIcon, XMarkIcon } from './components/Icon';
import { DEFAULT_SETTINGS } from './constants';
import { GeneratedImage, GenerationSettings } from './types';
import { generateImages } from './services/geminiService';

const App: React.FC = () => {
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '',
    ...DEFAULT_SETTINGS,
    referenceImage: null
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // UI State for inputs
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSettingChange = useCallback((key: keyof GenerationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGenerate = async () => {
    if (!settings.prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrls = await generateImages(settings);
      
      const newImages: GeneratedImage[] = imageUrls.map((url) => ({
        id: Math.random().toString(36).substring(7),
        url,
        prompt: settings.prompt,
        settings: { ...settings },
        createdAt: Date.now(),
      }));

      setGeneratedImages(prev => [...newImages, ...prev]);
    } catch (err: any) {
      console.error("Generation error:", err);
      let msg = "Failed to generate images. Please try again.";
      if (err.message?.includes("API key")) {
          msg = "API Key error. If using Pro features, please ensure a key is selected.";
      }
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.metaKey) {
          handleGenerate();
      }
  }

  // --- Image Input Handlers ---

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          referenceImage: {
            data: reader.result as string,
            mimeType: file.type
          }
        }));
        setShowAttachMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowAttachMenu(false);
    setShowCamera(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (e) {
        console.error("Camera error:", e);
        setError("Could not access camera. Please check permissions.");
        setShowCamera(false);
    }
  };

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      setShowCamera(false);
  };

  const capturePhoto = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg');
              setSettings(prev => ({
                  ...prev,
                  referenceImage: {
                      data: dataUrl,
                      mimeType: 'image/jpeg'
                  }
              }));
              stopCamera();
          }
      }
  };

  const removeReferenceImage = () => {
      setSettings(prev => ({ ...prev, referenceImage: null }));
  };
  
  // Attach effect for video ref in modal
  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar Controls */}
      <Controls 
        settings={settings} 
        onUpdate={handleSettingChange} 
        disabled={isGenerating}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Bar / Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Lumina</h1>
            </div>
        </header>

        {/* Scrollable Gallery Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {generatedImages.length === 0 && !isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800">
                    <MagicWandIcon className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-lg font-medium">Your canvas is empty</p>
                <p className="text-sm max-w-md text-center text-gray-600">Configure your settings on the left, enter a prompt below, and watch the magic happen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
                {/* Loading Skeletons */}
                {isGenerating && Array.from({ length: settings.numberOfImages }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="aspect-square rounded-xl bg-gray-900 border border-gray-800 animate-pulse flex flex-col items-center justify-center space-y-3">
                         <SparklesIcon className="w-8 h-8 text-indigo-500 animate-bounce" />
                         <span className="text-xs text-indigo-400 font-mono">Generating...</span>
                    </div>
                ))}
                
                {/* Actual Images */}
                {generatedImages.map((img) => (
                    <ImageCard key={img.id} image={img} />
                ))}
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent pt-20 pb-8 px-6">
            <div className="max-w-4xl mx-auto relative">
                {error && (
                    <div className="absolute -top-12 left-0 right-0 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {error}
                    </div>
                )}
                
                <div className="relative bg-gray-900 p-1.5 rounded-2xl shadow-2xl ring-1 ring-white/10 focus-within:ring-indigo-500/50 transition-all duration-300">
                    
                    {/* Attached Image Preview */}
                    {settings.referenceImage && (
                        <div className="px-4 pt-3 pb-1 flex">
                            <div className="relative group">
                                <img 
                                    src={settings.referenceImage.data} 
                                    alt="Reference" 
                                    className="h-16 w-16 object-cover rounded-lg border border-gray-700" 
                                />
                                <button 
                                    onClick={removeReferenceImage}
                                    className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 transition-all"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-end">
                        {/* Attach Button */}
                        <div className="relative ml-2 mb-2">
                            <button
                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                                className={`p-2 rounded-xl transition-all ${showAttachMenu ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                            
                            {/* Attachment Menu */}
                            {showAttachMenu && (
                                <div className="absolute bottom-12 left-0 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-2 flex flex-col gap-1 w-40 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-left">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-left"
                                    >
                                        <PhotoIcon className="w-4 h-4" />
                                        <span>Upload Photo</span>
                                    </button>
                                    <button 
                                        onClick={startCamera}
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-left"
                                    >
                                        <CameraIcon className="w-4 h-4" />
                                        <span>Use Camera</span>
                                    </button>
                                </div>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                            />
                        </div>

                        <textarea
                            value={settings.prompt}
                            onChange={(e) => handleSettingChange('prompt', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe the image you want to imagine..."
                            className="w-full bg-transparent text-white placeholder-gray-500 text-lg px-4 py-3 min-h-[60px] max-h-[120px] focus:outline-none resize-none custom-scrollbar rounded-xl"
                            rows={1}
                        />
                        
                        <div className="mb-2 mr-2">
                             <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !settings.prompt.trim()}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                                    isGenerating || !settings.prompt.trim()
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95'
                                }`}
                            >
                                {isGenerating ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <MagicWandIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-600 mt-3">
                    Powered by Google Gemini • {settings.resolution !== '1K' || settings.useGrounding ? 'Pro Mode Active' : 'Standard Mode'}
                </p>
            </div>
        </div>

        {/* Camera Modal */}
        {showCamera && (
            <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                 <div className="relative w-full max-w-3xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                    <div className="absolute top-4 right-4 z-10">
                        <button 
                            onClick={stopCamera}
                            className="p-2 bg-black/50 text-white rounded-full hover:bg-white/20 backdrop-blur-md"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="aspect-video bg-black flex items-center justify-center">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
                        />
                    </div>
                    
                    <div className="p-6 flex justify-center bg-gray-900">
                        <button 
                            onClick={capturePhoto}
                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full group-hover:scale-90 transition-transform"></div>
                        </button>
                    </div>
                 </div>
            </div>
        )}

      </main>
      
      {/* Click outside to close menu handler */}
      {showAttachMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)}></div>
      )}
    </div>
  );
};

export default App;