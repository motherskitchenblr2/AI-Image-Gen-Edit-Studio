import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import { 
  Play, Sparkles, Image, Video, Bot, Terminal as TerminalIcon, 
  Send, X, Menu, Zap, Clock, CheckCircle, AlertCircle,
  RefreshCw, Wand2, Users, Repeat, Palette,
  Cpu, Minimize2, Maximize2, Edit3, Sliders, Wrench, Shield,
  Database, Wifi, Server, Bug, Gauge, Activity, Settings,
  Lock, LogOut, Power, Moon, Sun, Download, Upload, Eye, EyeOff,
  CreditCard, TrendingUp, AlertTriangle, BarChart3, Layers, Type
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Generate session ID
const getSessionId = () => {
  let sid = localStorage.getItem('bots_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bots_session_id', sid);
  }
  return sid;
};

const SESSION_ID = getSessionId();

// API helper with session
const api = axios.create({
  baseURL: API_URL,
  headers: { 'X-Session-ID': SESSION_ID }
});

// ================== AI CONTROLS ==================
const AI_CONTROLS = {
  style: { label: 'Style', options: ['Realistic', 'Anime', 'Cyberpunk', 'Minimalist', 'Abstract', 'Cinematic', 'Fantasy'] },
  lighting: { label: 'Lighting', options: ['Neon', 'Cinematic', 'Natural', 'HDR', 'Low-key', 'Dramatic', 'Soft'] },
  palette: { label: 'Color Palette', options: ['Dark', 'Neon', 'Pastel', 'Monochrome', 'Gradient', 'Vibrant'] },
  mood: { label: 'Mood', options: ['Energetic', 'Calm', 'Futuristic', 'Dramatic', 'Playful', 'Mysterious'] },
  resolution: { label: 'Resolution', options: ['720p', '1080p', '2K', '4K'] },
  aspectRatio: { label: 'Aspect Ratio', options: ['1:1', '16:9', '9:16', '21:9'] },
  enhancements: { label: 'Enhancements', options: ['Upscale', 'Sharpen', 'Glow', 'Depth of Field', 'Film Grain'] }
};

const VIDEO_TOOLS = [
  { id: 'text_to_video', name: 'Text to Video', icon: Video, color: 'from-cyan-500 to-blue-500', cost: 2.0 },
  { id: 'image_to_video', name: 'Image to Video', icon: Image, color: 'from-purple-500 to-pink-500', cost: 1.5 },
  { id: 'head_swap', name: 'Head Swap', icon: Users, color: 'from-orange-500 to-red-500', cost: 1.0 },
  { id: 'actor_swap', name: 'Actor Swap', icon: Repeat, color: 'from-green-500 to-emerald-500', cost: 1.5 },
  { id: 'avatar', name: 'AI Avatar', icon: Bot, color: 'from-indigo-500 to-violet-500', cost: 2.0 },
  { id: 'nano_banana', name: 'Nano Banana', icon: Palette, color: 'from-yellow-500 to-amber-500', cost: 0.5 },
];

// ================== CREDIT METER COMPONENT ==================
const CreditMeter = ({ credits, onRefresh }) => {
  const percentage = (credits.remaining / 100) * 100;
  const color = percentage > 50 ? 'from-green-500 to-emerald-500' : percentage > 20 ? 'from-yellow-500 to-amber-500' : 'from-red-500 to-pink-500';
  
  return (
    <div className="card-cinematic p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-medium text-white">Credits</span>
        </div>
        <button onClick={onRefresh} className="p-1 hover:bg-purple-500/20 rounded">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Remaining</span>
          <span className="text-white font-mono">{credits.remaining.toFixed(1)}</span>
        </div>
        <div className="h-2 bg-black/60 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Used: {credits.used.toFixed(1)}</span>
          <span>Session: 100</span>
        </div>
      </div>
    </div>
  );
};

// ================== HEADER ==================
const Header = ({ onOpenAdmin, onOpenTerminal, onOpenRobo, systemStatus, credits, activeTab, setActiveTab }) => {
  const [secretTaps, setSecretTaps] = useState(0);
  
  const handleLogoClick = () => {
    setSecretTaps(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        onOpenAdmin();
        return 0;
      }
      setTimeout(() => setSecretTaps(0), 2000);
      return newCount;
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center neon-glow">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Bots Factory
              </h1>
              <p className="text-[10px] text-gray-500">Enterprise v4.0</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {['generate', 'studio', 'prompt', 'gallery'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeTab === tab ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-purple-500/10 text-gray-400'}`}
              >
                <span className="text-sm font-medium capitalize">{tab}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Credit Display */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/60 border border-purple-500/20">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-mono text-white">{credits.remaining.toFixed(1)}</span>
              <span className="text-xs text-gray-500">credits</span>
            </div>

            {/* LED Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/60 border border-purple-500/20">
              <div className={`led-indicator ${systemStatus?.database === 'online' ? 'led-green' : 'led-red'}`} />
              <div className={`led-indicator ${systemStatus?.llm_enabled ? 'led-green' : 'led-yellow'}`} />
            </div>

            <button onClick={onOpenTerminal} className="p-2.5 rounded-xl bg-black/60 border border-purple-500/20 hover:border-cyan-500/50 transition-all">
              <TerminalIcon className="w-5 h-5 text-gray-400 hover:text-cyan-400" />
            </button>

            <button onClick={onOpenRobo} className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 hover:border-cyan-500/60 transition-all relative">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full led-green" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ================== ADMIN DASHBOARD ==================
const AdminDashboard = ({ isOpen, onClose, systemHealth, onSystemAction }) => {
  const [activePanel, setActivePanel] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [logs, setLogs] = useState([]);
  const [features, setFeatures] = useState({});
  const [theme, setTheme] = useState('dark');

  const handleLogin = async () => {
    try {
      const response = await api.post('/api/admin/login', { username, password });
      if (response.data.success) {
        setAdminToken(response.data.token);
        setIsLoggedIn(true);
        setLoginError('');
        fetchAdminData(response.data.token);
      }
    } catch (error) {
      setLoginError('Invalid credentials');
    }
  };

  const fetchAdminData = async (token) => {
    try {
      const [overviewRes, logsRes] = await Promise.all([
        api.get('/api/admin/overview', { headers: { 'X-Admin-Token': token } }),
        api.get('/api/admin/logs', { headers: { 'X-Admin-Token': token } })
      ]);
      setFeatures(overviewRes.data.overview?.feature_flags || {});
      setLogs(logsRes.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch admin data');
    }
  };

  const handleSystemAction = async (action) => {
    try {
      await api.post(`/api/admin/system/${action}`, {}, { headers: { 'X-Admin-Token': adminToken } });
      onSystemAction(action);
    } catch (error) {
      console.error(`Failed to ${action} system`);
    }
  };

  const toggleFeature = async (feature) => {
    try {
      const newValue = !features[feature];
      await api.post('/api/admin/feature-toggle', { feature, enabled: newValue }, { headers: { 'X-Admin-Token': adminToken } });
      setFeatures(prev => ({ ...prev, [feature]: newValue }));
    } catch (error) {
      console.error('Failed to toggle feature');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex">
      {/* Login Screen */}
      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="card-cinematic p-8 w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 neon-glow">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Admin Access</h2>
              <p className="text-sm text-gray-400 mt-1">Secure login required</p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="input-cinematic w-full"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-cinematic w-full"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button onClick={handleLogin} className="btn-neon w-full py-3">
                Login
              </button>
              <button onClick={onClose} className="w-full py-2 text-gray-400 hover:text-white text-sm">
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">Default: admin / admin123</p>
          </div>
        </div>
      ) : (
        /* Admin Dashboard */
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-black/80 border-r border-purple-500/20 p-4 space-y-2">
            <div className="flex items-center space-x-3 mb-6 px-2">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white">Admin Panel</h3>
                <p className="text-xs text-gray-500">Enterprise Control</p>
              </div>
            </div>

            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'features', icon: Layers, label: 'Feature Controls' },
              { id: 'theme', icon: Moon, label: 'Theme' },
              { id: 'security', icon: Shield, label: 'Security' },
              { id: 'logs', icon: Database, label: 'Logs & Audit' },
              { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${activePanel === item.id ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400' : 'text-gray-400 hover:bg-purple-500/10'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}

            <div className="pt-4 border-t border-purple-500/20">
              <button onClick={onClose} className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Exit Admin</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white capitalize">{activePanel}</h2>
              <button onClick={onClose} className="p-2 hover:bg-purple-500/20 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Overview Panel */}
            {activePanel === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'System Status', value: systemHealth?.database || 'online', icon: Server, color: 'green' },
                    { label: 'Active Sessions', value: '12', icon: Users, color: 'cyan' },
                    { label: 'Credits Used', value: '847.5', icon: CreditCard, color: 'purple' },
                    { label: 'Uptime', value: '99.9%', icon: TrendingUp, color: 'pink' },
                  ].map((stat, idx) => (
                    <div key={idx} className="card-cinematic p-4">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                        <div className={`led-indicator led-${stat.color === 'green' ? 'green' : stat.color === 'cyan' ? 'green' : 'yellow'}`} />
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="card-cinematic p-6">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">System Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Gauge className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-white">24ms</p>
                      <p className="text-xs text-gray-500">Latency</p>
                    </div>
                    <div className="text-center">
                      <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-white">18%</p>
                      <p className="text-xs text-gray-500">CPU</p>
                    </div>
                    <div className="text-center">
                      <Database className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                      <p className="text-xl font-bold text-white">52%</p>
                      <p className="text-xs text-gray-500">Memory</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Controls */}
            {activePanel === 'features' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-4">Toggle providers and features. Mock mode until .env keys provided.</p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(features).map(([feature, enabled]) => (
                    <div key={feature} className="card-cinematic p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">{feature.replace('_ENABLED', '').replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{enabled ? 'Active' : 'Mock Mode'}</p>
                      </div>
                      <button
                        onClick={() => toggleFeature(feature)}
                        className={`w-12 h-6 rounded-full transition-all ${enabled ? 'bg-green-500' : 'bg-gray-700'} relative`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Panel */}
            {activePanel === 'theme' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {['dark', 'light', 'system'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`card-cinematic p-6 text-center ${theme === t ? 'border-cyan-500' : ''}`}
                    >
                      {t === 'dark' ? <Moon className="w-8 h-8 mx-auto mb-2 text-purple-400" /> :
                       t === 'light' ? <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-400" /> :
                       <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />}
                      <p className="text-sm text-white capitalize">{t}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Panel */}
            {activePanel === 'security' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleSystemAction('shutdown')} className="card-cinematic p-4 hover:border-red-500/50 transition-all">
                    <Power className="w-6 h-6 text-red-400 mb-2" />
                    <p className="text-sm text-white">Shutdown</p>
                  </button>
                  <button onClick={() => handleSystemAction('restart')} className="card-cinematic p-4 hover:border-yellow-500/50 transition-all">
                    <RefreshCw className="w-6 h-6 text-yellow-400 mb-2" />
                    <p className="text-sm text-white">Restart</p>
                  </button>
                  <button onClick={() => handleSystemAction('maintenance')} className="card-cinematic p-4 hover:border-purple-500/50 transition-all">
                    <Wrench className="w-6 h-6 text-purple-400 mb-2" />
                    <p className="text-sm text-white">Maintenance</p>
                  </button>
                  <button onClick={() => handleSystemAction('start')} className="card-cinematic p-4 hover:border-green-500/50 transition-all">
                    <Play className="w-6 h-6 text-green-400 mb-2" />
                    <p className="text-sm text-white">Start</p>
                  </button>
                </div>
              </div>
            )}

            {/* Logs Panel */}
            {activePanel === 'logs' && (
              <div className="space-y-4">
                <div className="flex justify-between mb-4">
                  <p className="text-sm text-gray-400">Recent system logs</p>
                  <button className="input-cinematic text-xs px-3 py-1 flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.slice(0, 20).map((log, idx) => (
                    <div key={idx} className={`p-3 rounded-lg bg-black/40 border-l-2 ${log.severity === 'error' ? 'border-red-500' : log.severity === 'warning' ? 'border-yellow-500' : 'border-green-500'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-cyan-400">{log.action}</span>
                        <span className="text-xs text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{JSON.stringify(log.data)}</p>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-center text-gray-600 py-8">No logs available</p>}
                </div>
              </div>
            )}

            {/* Terminal Panel */}
            {activePanel === 'terminal' && (
              <AdminTerminal adminToken={adminToken} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ================== ADMIN TERMINAL ==================
const AdminTerminal = ({ adminToken }) => {
  const [history, setHistory] = useState([{ type: 'info', content: '🔒 Admin Terminal Connected. Type "help" for commands.' }]);
  const [input, setInput] = useState('');
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [history]);

  const execute = async () => {
    if (!input.trim()) return;
    setHistory(prev => [...prev, { type: 'input', content: input }]);
    
    try {
      const response = await api.post('/api/terminal/execute', { command: input, session_id: SESSION_ID });
      if (response.data.type === 'clear') {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, { type: response.data.type, content: response.data.output }]);
      }
    } catch (error) {
      setHistory(prev => [...prev, { type: 'error', content: `Error: ${error.message}` }]);
    }
    setInput('');
  };

  return (
    <div className="terminal-cinematic h-96">
      <div ref={terminalRef} className="h-80 overflow-y-auto p-4 font-mono text-sm bg-black">
        {history.map((line, idx) => (
          <div key={idx} className={`mb-1 whitespace-pre-wrap ${line.type === 'input' ? 'text-cyan-400' : line.type === 'error' ? 'text-red-400' : line.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
            {line.type === 'input' ? `$ ${line.content}` : line.content}
          </div>
        ))}
      </div>
      <div className="flex items-center px-4 py-3 bg-black/80 border-t border-cyan-500/20">
        <span className="text-cyan-400 mr-2">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && execute()}
          className="flex-1 bg-transparent text-white font-mono text-sm outline-none"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
};

// ================== MULTI-IMAGE UPLOAD ==================
const MultiImageUpload = ({ onUpload, maxImages = 6 }) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const newFiles = Array.from(files).slice(0, maxImages - images.length);
    const newPreviews = [];
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === newFiles.length) {
          setImages(prev => [...prev, ...newFiles]);
          setPreviews(prev => [...prev, ...newPreviews]);
          onUpload([...images, ...newFiles], [...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
    onUpload(newImages, newPreviews);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Images ({previews.length}/{maxImages})</span>
        <button onClick={() => fileInputRef.current?.click()} disabled={previews.length >= maxImages} className="input-cinematic text-xs px-3 py-1 flex items-center space-x-1">
          <Upload className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {previews.map((preview, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-purple-500/20">
            <img src={preview} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
            <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {previews.length < maxImages && (
          <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-purple-500/30 hover:border-cyan-500/50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>
      
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
    </div>
  );
};

// ================== GENERATION STUDIO ==================
const GenerationStudio = ({ onGenerate, loading, credits }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [aiParams, setAiParams] = useState({});
  const [images, setImages] = useState([]);
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    if (selectedTool) {
      setEstimatedCost(selectedTool.cost);
    }
  }, [selectedTool]);

  const handleGenerate = () => {
    if (!selectedTool || credits.remaining < estimatedCost) return;
    onGenerate({
      tool_type: selectedTool.id,
      model: 'nano_banana',
      prompt,
      image_urls: images,
      settings: aiParams,
      session_id: SESSION_ID
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Controls */}
      <div className="card-cinematic p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Advanced Controls</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(AI_CONTROLS).map(([key, config]) => (
            <div key={key}>
              <label className="text-xs text-cyan-400 uppercase tracking-wider">{config.label}</label>
              <select
                value={aiParams[key] || ''}
                onChange={(e) => setAiParams({ ...aiParams, [key]: e.target.value })}
                className="select-cinematic w-full mt-1 text-sm"
              >
                <option value="">Select</option>
                {config.options.map(opt => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool Selection */}
        <div className="lg:col-span-2 card-cinematic p-6">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase mb-4">Generation Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {VIDEO_TOOLS.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-4 rounded-xl border transition-all ${selectedTool?.id === tool.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-purple-500/20 hover:border-purple-500/40'}`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-white font-medium">{tool.name}</p>
                  <p className="text-xs text-cyan-400 mt-1">{tool.cost} credits</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload & Cost */}
        <div className="space-y-4">
          <MultiImageUpload onUpload={(files, previews) => setImages(previews)} />
          
          {/* Cost Estimate */}
          <div className="card-cinematic p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Estimated Cost</span>
              <span className="text-lg font-bold text-cyan-400">{estimatedCost} credits</span>
            </div>
            {credits.remaining < estimatedCost && (
              <div className="flex items-center space-x-2 text-red-400 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Insufficient credits</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="card-cinematic p-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to create..."
          className="input-cinematic w-full h-24 resize-none mb-4"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedTool || !prompt || credits.remaining < estimatedCost}
          className={`btn-neon w-full py-3 flex items-center justify-center space-x-2 ${(!selectedTool || !prompt || credits.remaining < estimatedCost) ? 'opacity-50' : ''}`}
        >
          {loading ? <div className="w-5 h-5 spinner" /> : <Wand2 className="w-5 h-5" />}
          <span>{loading ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>
    </div>
  );
};

// ================== ROBO CHAT ==================
const RoboChat = ({ isOpen, onClose, credits }) => {
  const [messages, setMessages] = useState([
    { role: 'robo', content: `🤖 Robo 1.0 Enterprise online.\n\n💳 Credits: ${credits.remaining.toFixed(1)}\n\nI can help with generation, credits, and system status. Try: "credits", "help", "status"` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/robo/chat', { message: input, session_id: SESSION_ID });
      setMessages(prev => [...prev, { role: 'robo', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'robo', content: 'Connection issue. Please try again.' }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <div className="card-cinematic overflow-hidden border-cyan-500/30">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-cyan-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Robo 1.0</p>
              <p className="text-xs text-green-400">Enterprise</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-purple-500/20 rounded">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div ref={chatRef} className="h-72 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'bg-purple-500/20 text-gray-200'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && <div className="flex space-x-1 px-3"><div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} /><div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} /></div>}
        </div>

        <div className="p-3 border-t border-purple-500/20">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask Robo..."
              className="input-cinematic flex-1 text-sm py-2"
            />
            <button onClick={send} className="btn-neon px-3 py-2"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== TERMINAL ==================
const Terminal = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([{ type: 'banner', content: `╔═══════════════════════════════════════════╗
║  BOTS FACTORY DEV CONSOLE v4.0            ║
║  Enterprise • Credit-Managed • Mock-First ║
╚═══════════════════════════════════════════╝

Type "help" for commands. Type "credits" for balance.` }]);
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [history]);

  const execute = async () => {
    if (!input.trim()) return;
    setHistory(prev => [...prev, { type: 'input', content: input }]);
    
    if (input === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    try {
      const response = await api.post('/api/terminal/execute', { command: input, session_id: SESSION_ID });
      setHistory(prev => [...prev, { type: response.data.type, content: response.data.output }]);
    } catch (error) {
      setHistory(prev => [...prev, { type: 'error', content: `Error: ${error.message}` }]);
    }
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed ${minimized ? 'bottom-4 right-4 w-80' : 'bottom-4 right-4 w-[550px]'} z-50 transition-all`}>
      <div className="terminal-cinematic shadow-2xl">
        <div className="terminal-header">
          <div className="flex items-center space-x-3">
            <div className="terminal-dots">
              <button onClick={onClose} className="terminal-dot bg-red-500 hover:bg-red-400" />
              <button onClick={() => setMinimized(!minimized)} className="terminal-dot bg-yellow-500 hover:bg-yellow-400" />
              <button className="terminal-dot bg-green-500 hover:bg-green-400" />
            </div>
            <span className="text-sm font-mono text-cyan-400">dev@bots-factory</span>
          </div>
          <div className="led-indicator led-green" />
        </div>

        {!minimized && (
          <>
            <div ref={terminalRef} className="h-72 overflow-y-auto p-4 font-mono text-sm bg-black">
              {history.map((line, idx) => (
                <div key={idx} className={`mb-1 whitespace-pre-wrap ${line.type === 'input' ? 'text-cyan-400' : line.type === 'error' ? 'text-red-400' : line.type === 'success' ? 'text-green-400' : line.type === 'banner' ? 'text-purple-400' : 'text-gray-300'}`}>
                  {line.type === 'input' ? `$ ${line.content}` : line.content}
                </div>
              ))}
            </div>
            <div className="flex items-center px-4 py-3 bg-black/80 border-t border-cyan-500/20">
              <span className="text-cyan-400 mr-2">$</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && execute()}
                placeholder="Enter command..."
                className="flex-1 bg-transparent text-white font-mono text-sm outline-none"
                autoFocus
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ================== GALLERY ==================
const Gallery = ({ items, loading }) => {
  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 spinner" /></div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="card-cinematic overflow-hidden group cursor-pointer">
          <div className="aspect-video relative">
            <img src={item.thumbnail || `https://picsum.photos/seed/${idx}/400/300`} alt={item.prompt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-300 line-clamp-2">{item.prompt}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ================== MAIN APP ==================
function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [gallery, setGallery] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [credits, setCredits] = useState({ remaining: 100, used: 0 });
  const [loading, setLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [roboOpen, setRoboOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [idleTime, setIdleTime] = useState(0);

  // Fetch data
  useEffect(() => {
    fetchCredits();
    fetchGallery();
    fetchHealth();
    const interval = setInterval(() => {
      fetchCredits();
      fetchHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Idle detection
  useEffect(() => {
    const resetIdle = () => setIdleTime(0);
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    
    const idleInterval = setInterval(() => {
      setIdleTime(prev => {
        if (prev >= 15 * 60) {
          // 15 minutes idle - pause session
          console.log('Session idle timeout');
        }
        return prev + 1;
      });
    }, 1000);
    
    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      clearInterval(idleInterval);
    };
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await api.get(`/api/credits/${SESSION_ID}`);
      if (response.data.success) {
        setCredits(response.data.credits);
      }
    } catch (error) {
      console.error('Failed to fetch credits');
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await api.get('/api/gallery');
      setGallery(response.data.items || []);
    } catch (error) {
      setGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await api.get('/api/health');
      setSystemHealth(response.data.diagnostics);
    } catch (error) {
      console.error('Failed to fetch health');
    }
  };

  const handleGenerate = async (params) => {
    setLoading(true);
    try {
      const response = await api.post('/api/generate', params);
      if (response.data.success) {
        setCredits(prev => ({ ...prev, remaining: response.data.credits_remaining }));
        setTimeout(fetchGallery, 2000);
      } else {
        alert(response.data.error || 'Generation failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black cyber-grid-bg">
      <Header
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenTerminal={() => setTerminalOpen(true)}
        onOpenRobo={() => setRoboOpen(true)}
        systemStatus={systemHealth}
        credits={credits}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {activeTab === 'generate' && (
          <>
            <section className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent neon-text mb-2">
                AI Studio
              </h1>
              <p className="text-gray-400">Enterprise • Credit-Managed • Mock-First</p>
            </section>
            <GenerationStudio onGenerate={handleGenerate} loading={loading} credits={credits} />
          </>
        )}

        {activeTab === 'studio' && <GenerationStudio onGenerate={handleGenerate} loading={loading} credits={credits} />}

        {activeTab === 'prompt' && (
          <div className="text-center py-12">
            <Type className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Prompt Lab</h2>
            <p className="text-gray-400 mb-6">AI-powered prompt refinement and generation</p>
            <div className="max-w-2xl mx-auto card-cinematic p-6">
              <textarea className="input-cinematic w-full h-32 mb-4" placeholder="Enter your prompt to refine..." />
              <button className="btn-neon w-full py-3">Refine Prompt (0.1 credits)</button>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Gallery</h2>
              <button onClick={fetchGallery} className="input-cinematic px-4 py-2 text-sm flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            <Gallery items={gallery} loading={galleryLoading} />
          </section>
        )}
      </main>

      {/* Floating Credit Meter */}
      <div className="fixed bottom-4 left-4 z-40 w-64">
        <CreditMeter credits={credits} onRefresh={fetchCredits} />
      </div>

      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <RoboChat isOpen={roboOpen} onClose={() => setRoboOpen(false)} credits={credits} />
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        systemHealth={systemHealth}
        onSystemAction={(action) => console.log('System action:', action)}
      />
    </div>
  );
}

export default App;
