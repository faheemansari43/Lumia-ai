import React from 'react';
import { AspectRatio, Resolution, GenerationSettings } from '../types';
import { ASPECT_RATIOS, RESOLUTIONS, MAX_IMAGES } from '../constants';
import { SettingsIcon, SearchIcon } from './Icon';

interface ControlsProps {
  settings: GenerationSettings;
  onUpdate: (key: keyof GenerationSettings, value: any) => void;
  disabled?: boolean;
}

const Controls: React.FC<ControlsProps> = ({ settings, onUpdate, disabled }) => {
  
  // Check if current settings will trigger Pro model
  const isPro = settings.resolution !== '1K' || settings.useGrounding;

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-gray-900 border-r border-gray-800 p-6 overflow-y-auto lg:h-screen custom-scrollbar">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Configuration</h2>
      </div>

      <div className="space-y-8">
        {/* Resolution */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Resolution</label>
          <div className="grid grid-cols-3 gap-2">
            {RESOLUTIONS.map((res) => (
              <button
                key={res}
                onClick={() => onUpdate('resolution', res)}
                disabled={disabled}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  settings.resolution === res
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 ring-1 ring-indigo-500'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {settings.resolution !== '1K' ? '✨ Uses Gemini 3 Pro (Paid Key)' : 'Uses Gemini 2.5 Flash'}
          </p>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Aspect Ratio</label>
          <div className="grid grid-cols-4 gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                onClick={() => onUpdate('aspectRatio', ratio)}
                disabled={disabled}
                className={`px-2 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                  settings.aspectRatio === ratio
                    ? 'bg-indigo-600 text-white ring-1 ring-indigo-500'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Image Count */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Image Count</label>
            <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-indigo-400">{settings.numberOfImages}</span>
          </div>
          <input
            type="range"
            min="1"
            max={MAX_IMAGES}
            step="1"
            value={settings.numberOfImages}
            onChange={(e) => onUpdate('numberOfImages', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
          />
          <div className="flex justify-between text-xs text-gray-600 px-1">
            <span>1</span>
            <span>{MAX_IMAGES}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Creativity (Temp)</label>
            <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-indigo-400">{settings.temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => onUpdate('temperature', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
          />
          <div className="flex justify-between text-xs text-gray-600 px-1">
            <span>Conservative</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Grounding */}
        <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <SearchIcon className="w-4 h-4 text-indigo-400" />
                    <label className="text-sm font-medium text-gray-300">Google Grounding</label>
                 </div>
                <div 
                    onClick={() => !disabled && onUpdate('useGrounding', !settings.useGrounding)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${settings.useGrounding ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.useGrounding ? 'translate-x-5' : ''}`}></div>
                </div>
            </div>
            <p className="text-xs text-gray-500">
                Enables real-time search for up-to-date context. ✨ Requires Gemini 3 Pro.
            </p>
        </div>
        
        {isPro && (
           <div className="mt-6 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
              <p className="text-xs text-indigo-200 leading-relaxed">
                 <strong className="text-indigo-400">Note:</strong> You have selected features (High Res or Grounding) that utilize <strong>Gemini 3 Pro</strong>. You may be prompted to select a paid API key.
              </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
