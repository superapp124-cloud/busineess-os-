import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  RotateCcw, 
  Key, 
  CheckCircle2, 
  Clock, 
  Film, 
  Wand2, 
  Sliders, 
  Copy, 
  ExternalLink,
  Layers,
  Flame,
  AlertCircle,
  Zap,
  Cpu,
  Server,
  AlertTriangle
} from 'lucide-react';
import { KlingVideoClient, KlingVideoTaskRequest } from '@/services/mediaAgency/production/KlingVideoClient';
import { RunwayVideoClient, RunwayTaskRequest } from '@/services/mediaAgency/production/RunwayVideoClient';
import { ComfyUiVideoClient } from '@/services/mediaAgency/production/ComfyUiVideoClient';

interface PromptPreset {
  id: string;
  title: string;
  badge: string;
  prompt: string;
  negativePrompt: string;
  previewThumbnail: string;
}

const VIDEO_PRESETS: PromptPreset[] = [
  {
    id: 'gurugram_monsoon_reporter',
    title: 'Gurugram Monsoon Flood News Reporter (Your 30s Prompt)',
    badge: 'Breaking News / Ground Report',
    prompt: `Create a 30-second photorealistic Indian television news field report about the current monsoon waterlogging situation in Gurugram, Haryana.

Format: 9:16 vertical, 1080×1920, cinematic documentary realism, photorealistic, natural handheld camera movement, realistic Indian monsoon atmosphere, authentic human expressions, realistic water physics, realistic traffic and crowd behavior, natural ambient sound, no artificial-looking CGI.

Main reporter: A young adult Indian female field news reporter, professional and credible appearance, wearing a royal blue embroidered kurti, modest professional styling, natural wet hair from the rain, subtle realistic makeup partially affected by rain, holding a professional television news microphone with a fictional generic news-channel logo. She speaks directly to camera with urgency but remains calm and professional.

Location: Gurugram/Gurgaon, Haryana, during the monsoon. A major urban road is heavily waterlogged after intense rainfall. Water covers substantial portions of the roadway, vehicles move slowly through standing water, motorcycles and cars navigate carefully, pedestrians use the edges of the road, traffic is congested, rain continues falling, headlights reflect naturally on the wet road surface. High-rise commercial and residential buildings visible in background.

Scene progression:
1. Cinematic establishing shot of flooded Gurugram roadway with slow traffic and rain on lens.
2. Female reporter in royal blue kurti speaking into microphone: 'Gurugram is once again battling severe waterlogging after heavy monsoon rain, with several roads and key stretches affected.'
3. Quick documentary B-roll of cars splashing water and pedestrians navigating.
4. Reporter delivering closing update to camera with seriousness.`,
    negativePrompt: 'cartoon, CGI, 3D animation, blurry, fake flood effects, tsunami water, distorted hands, extra fingers, plastic skin, dry hair',
    previewThumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=720&q=85'
  },
  {
    id: 'village_kids_comedy',
    title: 'Cute Village Kids Utensil Banter (Facebook Reference)',
    badge: 'Viral Comedy',
    prompt: 'Two cute Indian village toddler siblings in traditional colorful printed clothes sitting in a rustic mud courtyard next to a blue water tub and steel thali plates, arguing cutely with expressive pouts and innocent hand gestures, water splashing, photorealistic 8k, warm golden sunlight, 9:16 vertical format',
    negativePrompt: 'blurry, distorted faces, unrealistic eyes, plastic skin, low resolution, 3D animation',
    previewThumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=85'
  },
  {
    id: 'romantic_90s_love',
    title: 'Bas Ek Baar Mil Jao... 🥺💖 (YouTube Short Reference)',
    badge: '90s Romantic Melodrama',
    prompt: 'A young Indian woman with emotional tearful eyes in traditional kurti walking slowly under warm yellow street lamps in evening rain, looking directly into camera with wistful longing expression, mist reflections, photorealistic 8k cinematic romance, 9:16 vertical format',
    negativePrompt: 'low quality, blurry, modern neon, robotic, distorted face',
    previewThumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=85'
  }
];

export const KlingAiVideoStudio: React.FC = () => {
  const [selectedEngine, setSelectedEngine] = useState<'runway_gen3' | 'kling_15' | 'local_comfyui'>('runway_gen3');
  const [apiKey, setApiKey] = useState<string>(
    selectedEngine === 'runway_gen3' ? RunwayVideoClient.getApiKey() : KlingVideoClient.getApiKey()
  );
  const [comfyUrl, setComfyUrl] = useState<string>(ComfyUiVideoClient.getEndpointUrl());
  const [comfyStatus, setComfyStatus] = useState<{ isOnline: boolean; vramInfo?: string }>({ isOnline: false });
  const [showConfigInput, setShowConfigInput] = useState<boolean>(false);
  
  const [selectedPreset, setSelectedPreset] = useState<PromptPreset>(VIDEO_PRESETS[0]);
  const [promptText, setPromptText] = useState<string>(VIDEO_PRESETS[0].prompt);
  const [negativePromptText, setNegativePromptText] = useState<string>(VIDEO_PRESETS[0].negativePrompt);
  const [videoDuration, setVideoDuration] = useState<'5' | '10'>('5');
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatusMsg, setGenerationStatusMsg] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Check ComfyUI Status on mount
  useEffect(() => {
    ComfyUiVideoClient.checkHealth(comfyUrl).then(res => {
      setComfyStatus({ isOnline: res.isOnline, vramInfo: res.vramInfo });
    });
  }, [comfyUrl]);

  const handleEngineChange = (engine: 'runway_gen3' | 'kling_15' | 'local_comfyui') => {
    setSelectedEngine(engine);
    setApiErrorMessage(null);
    if (engine === 'runway_gen3') {
      setApiKey(RunwayVideoClient.getApiKey());
    } else if (engine === 'kling_15') {
      setApiKey(KlingVideoClient.getApiKey());
    }
  };

  const handleSaveConfig = () => {
    if (selectedEngine === 'runway_gen3') {
      RunwayVideoClient.setApiKey(apiKey);
    } else if (selectedEngine === 'kling_15') {
      KlingVideoClient.setApiKey(apiKey);
    } else {
      ComfyUiVideoClient.setEndpointUrl(comfyUrl);
      ComfyUiVideoClient.checkHealth(comfyUrl).then(res => {
        setComfyStatus({ isOnline: res.isOnline, vramInfo: res.vramInfo });
      });
    }
    setShowConfigInput(false);
    setApiErrorMessage(null);
  };

  const handleSelectPreset = (preset: PromptPreset) => {
    setSelectedPreset(preset);
    setPromptText(preset.prompt);
    setNegativePromptText(preset.negativePrompt);
    setGeneratedVideoUrl(null);
    setApiErrorMessage(null);
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(10);
    setGeneratedVideoUrl(null);
    setApiErrorMessage(null);

    const engineName = 
      selectedEngine === 'local_comfyui' 
        ? 'Local ComfyUI (Wan2.1)' 
        : selectedEngine === 'runway_gen3' 
        ? 'Runway Gen-4.5' 
        : 'Kling AI 1.5';

    setGenerationStatusMsg(`Connecting to ${engineName} and dispatching prompt...`);

    try {
      if (selectedEngine === 'local_comfyui') {
        setGenerationProgress(30);
        setGenerationStatusMsg('Dispatching workflow graph to local ComfyUI instance...');
        const res = await ComfyUiVideoClient.submitVideoWorkflow(promptText, negativePromptText, comfyUrl);
        setGenerationProgress(70);
        setGenerationStatusMsg(`Task ID: ${res.prompt_id}. Rendering on local GPU...`);
        
        setTimeout(() => {
          setGenerationProgress(100);
          setGenerationStatusMsg('Local rendering finished.');
          setIsGenerating(false);
        }, 8000);

      } else if (selectedEngine === 'runway_gen3') {
        const taskRequest: RunwayTaskRequest = {
          promptText: promptText.substring(0, 500), // Runway prompt character limit
          model: 'gen4.5',
          duration: videoDuration === '5' ? 5 : 10,
          ratio: '720:1280'
        };

        setGenerationProgress(25);
        setGenerationStatusMsg('Submitting prompt to RunwayML Gen-4.5 Text-to-Video API...');
        
        const task = await RunwayVideoClient.createVideoTask(taskRequest, apiKey);

        if (task.id) {
          setGenerationProgress(50);
          setGenerationStatusMsg(`Runway Task ID: ${task.id} (Polling neural cluster...)`);
          
          // Poll for completion
          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            try {
              const status = await RunwayVideoClient.getTaskStatus(task.id, apiKey);
              if (status.status === 'SUCCEEDED' && status.output && status.output.length > 0) {
                clearInterval(pollInterval);
                setGeneratedVideoUrl(status.output[0]);
                setGenerationProgress(100);
                setGenerationStatusMsg('Runway Video Ready!');
                setIsGenerating(false);
              } else if (status.status === 'FAILED') {
                clearInterval(pollInterval);
                setApiErrorMessage(`Runway task failed: ${status.failure || 'Unknown error'}`);
                setIsGenerating(false);
              } else {
                setGenerationProgress(Math.min(95, 50 + attempts * 5));
                setGenerationStatusMsg(`Runway generating frames... (${status.status})`);
              }
            } catch (err: any) {
              clearInterval(pollInterval);
              setApiErrorMessage(`Runway Polling Error: ${err.message}`);
              setIsGenerating(false);
            }
          }, 3000);
        }

      } else {
        const taskRequest: KlingVideoTaskRequest = {
          prompt: promptText.substring(0, 500),
          negative_prompt: negativePromptText,
          aspect_ratio: '9:16',
          duration: videoDuration,
          mode: 'std',
          model: 'kling-v1-5'
        };

        setGenerationProgress(25);
        setGenerationStatusMsg('Submitting prompt to Kling AI 1.5 API...');
        const task = await KlingVideoClient.submitTextToVideo(taskRequest, apiKey);

        if (task.data?.task_id) {
          setGenerationProgress(50);
          setGenerationStatusMsg(`Kling Task ID: ${task.data.task_id} (Rendering...)`);

          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            try {
              const status = await KlingVideoClient.queryTaskStatus(task.data!.task_id, apiKey);
              if (status.data.task_status === 'succeed' && status.data.task_result?.videos?.[0]?.url) {
                clearInterval(pollInterval);
                setGeneratedVideoUrl(status.data.task_result.videos[0].url);
                setGenerationProgress(100);
                setGenerationStatusMsg('Kling Video Ready!');
                setIsGenerating(false);
              } else if (status.data.task_status === 'failed') {
                clearInterval(pollInterval);
                setApiErrorMessage(`Kling task failed: ${status.data.task_status_msg || 'Generation failed'}`);
                setIsGenerating(false);
              } else {
                setGenerationProgress(Math.min(95, 50 + attempts * 5));
              }
            } catch (err: any) {
              clearInterval(pollInterval);
              setApiErrorMessage(`Kling Polling Error: ${err.message}`);
              setIsGenerating(false);
            }
          }, 3000);
        }
      }

    } catch (e: any) {
      setApiErrorMessage(e.message || 'API Connection Failed');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/40 rounded-2xl flex items-center justify-center text-purple-400">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">AI Generative Video Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
                  {selectedEngine === 'local_comfyui' 
                    ? 'LOCAL COMFYUI (₹0 GPU) 🖥️' 
                    : selectedEngine === 'runway_gen3' 
                    ? 'RUNWAY GEN-4.5 ⚡' 
                    : 'KLING 1.5 GENERATIVE 🚀'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct Text-to-Video API Engine • Realistic Indian Monsoon News, Village Comedy & Melodramas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 3-Way Engine Switcher */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => handleEngineChange('runway_gen3')}
                className={`px-3 py-1.5 rounded-xl transition ${selectedEngine === 'runway_gen3' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Runway Gen-4.5
              </button>
              <button
                onClick={() => handleEngineChange('kling_15')}
                className={`px-3 py-1.5 rounded-xl transition ${selectedEngine === 'kling_15' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Kling AI 1.5
              </button>
              <button
                onClick={() => handleEngineChange('local_comfyui')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${selectedEngine === 'local_comfyui' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Local ComfyUI</span>
              </button>
            </div>

            {/* Config Status Pill */}
            <button
              onClick={() => setShowConfigInput(!showConfigInput)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-mono flex items-center space-x-2 transition"
            >
              {selectedEngine === 'local_comfyui' ? (
                <>
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{comfyUrl} ({comfyStatus.isOnline ? 'ONLINE' : 'CONFIG'})</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  <span>Key: {apiKey ? `${apiKey.substring(0, 12)}...` : 'Not Set'}</span>
                </>
              )}
              <span className="text-slate-500 text-[10px]">Edit</span>
            </button>
          </div>
        </div>

        {/* API Error / Account Balance Alert */}
        {apiErrorMessage && (
          <div className="bg-rose-950/80 border-2 border-rose-500/60 p-4 rounded-2xl flex items-start space-x-3 shadow-2xl">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono text-rose-300 uppercase">Provider API Status:</h4>
              <p className="text-xs text-rose-200 font-mono leading-relaxed">{apiErrorMessage}</p>
              <p className="text-[11px] text-slate-300 mt-1">
                * Note: RunwayML & KlingAI require active account credits. To generate without credit limits, select <strong>Local ComfyUI</strong> for ₹0 local GPU rendering or top up credits on RunwayML/Kling.
              </p>
            </div>
          </div>
        )}

        {/* Config Edit Banner (Collapsible) */}
        {showConfigInput && (
          <div className="bg-slate-900 border border-emerald-500/40 p-4 rounded-2xl space-y-2 shadow-xl">
            <label className="text-xs font-mono font-bold text-emerald-400 uppercase">
              {selectedEngine === 'local_comfyui'
                ? 'Local ComfyUI Server Endpoint:'
                : selectedEngine === 'runway_gen3'
                ? 'RunwayML API Key (key_...):'
                : 'Kling AI API Key:'}
            </label>
            <div className="flex items-center space-x-2">
              {selectedEngine === 'local_comfyui' ? (
                <input
                  type="text"
                  value={comfyUrl}
                  onChange={(e) => setComfyUrl(e.target.value)}
                  placeholder="http://localhost:8188"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              ) : (
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              )}
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: 9:16 Video Preview & Player (5 Columns) */}
          <div className="md:col-span-5 flex flex-col items-center space-y-4">
            
            <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 relative flex items-center justify-center group">
              
              {/* Generated Video Element (When API Returns Live MP4) */}
              {generatedVideoUrl ? (
                <video
                  src={generatedVideoUrl}
                  autoPlay
                  loop
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : isGenerating ? (
                /* Generation Progress Overlay */
                <div className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto" />
                  <div className="space-y-1 font-mono">
                    <div className="text-sm font-bold text-white">{generationProgress}%</div>
                    <p className="text-[11px] text-purple-300 leading-relaxed">{generationStatusMsg}</p>
                  </div>
                </div>
              ) : (
                /* Static Scenario Preview */
                <div className="relative w-full h-full">
                  <img
                    src={selectedPreset.previewThumbnail}
                    alt={selectedPreset.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 flex flex-col justify-between p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 text-purple-300 font-mono text-[10px] font-bold border border-white/20 self-start">
                      PROMPT READY FOR API
                    </span>
                    <div className="bg-black/90 p-3.5 rounded-2xl border border-white/20 text-center space-y-1">
                      <p className="text-xs font-bold text-white line-clamp-2">{selectedPreset.title}</p>
                      <span className="text-[10px] text-emerald-400 font-mono block">Click Generate to Send to {selectedEngine === 'runway_gen3' ? 'Runway' : selectedEngine === 'kling_15' ? 'Kling' : 'ComfyUI'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Download Action when Generated */}
            {generatedVideoUrl && (
              <a
                href={generatedVideoUrl}
                download="ai_generated_field_report.mp4"
                target="_blank"
                rel="noreferrer"
                className="w-full max-w-[320px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xl transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Generated MP4 Video</span>
              </a>
            )}
          </div>

          {/* Right: Prompt Presets & Generation Controls (7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* 1. Indian Character & Scenario Presets */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>1. Choose Scenario Preset:</span>
                </h3>
                <span className="text-xs font-mono text-purple-400 font-bold">1-Click Load</span>
              </div>

              <div className="space-y-3">
                {VIDEO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full p-4 rounded-2xl border text-left transition space-y-1.5 ${
                      selectedPreset.id === preset.id
                        ? 'bg-purple-950/60 border-purple-500 shadow-lg ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold">
                        {preset.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{preset.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{preset.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Detailed Prompt Editor */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-yellow-400" />
                <span>2. AI Video Prompt (Sent directly to Model):</span>
              </h3>

              <div className="space-y-3">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition leading-relaxed"
                  placeholder="Describe your scene in detail..."
                />

                {/* Duration & Quality Selector */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setVideoDuration('5')}
                        className={`px-2 py-1 rounded-lg ${videoDuration === '5' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        5s
                      </button>
                      <button
                        onClick={() => setVideoDuration('10')}
                        className={`px-2 py-1 rounded-lg ${videoDuration === '10' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        10s
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Aspect Ratio:</span>
                    <span className="font-bold text-emerald-400">9:16 (1080x1920)</span>
                  </div>
                </div>

                {/* Main Generate Button */}
                <button
                  onClick={handleStartGeneration}
                  disabled={isGenerating}
                  className={`w-full py-4 rounded-2xl font-bold text-sm shadow-2xl flex items-center justify-center space-x-2 transition ${
                    isGenerating 
                      ? 'bg-purple-900 text-purple-300 cursor-wait animate-pulse' 
                      : 'bg-gradient-to-r from-emerald-600 via-purple-600 to-pink-600 hover:from-emerald-500 hover:to-pink-500 text-white shadow-purple-900/50'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {isGenerating 
                      ? 'Dispatching to Generative Video API...' 
                      : `🚀 Send Prompt to ${selectedEngine === 'local_comfyui' ? 'Local ComfyUI (₹0)' : selectedEngine === 'runway_gen3' ? 'Runway Gen-4.5' : 'Kling AI'} (9:16)`}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
