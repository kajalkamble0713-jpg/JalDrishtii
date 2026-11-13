import React, { useState, useEffect } from 'react';
import { DiseaseType, DistrictData, GlobeControlsState } from './types';
import { DISTRICTS_DATA, RECENT_ALERTS } from './data/jaldrishtiData';
import { useLiveEnvironmentalData } from './hooks/useLiveEnvironmentalData';
import { Header } from './components/Header';
import { RiskMapOverview } from './components/RiskMapOverview';
import { DistrictDetailView } from './components/DistrictDetailView';
import { TrendsView } from './components/TrendsView';
import { ModelPerformanceView } from './components/ModelPerformanceView';
import { SimulatorView } from './components/SimulatorView';
import { DataProvenancePanel } from './components/DataProvenancePanel';
import { DeveloperPromptModal } from './components/DeveloperPromptModal';
import { AstroSplashIntro } from './components/AstroSplashIntro';
import { GovernmentOperationsHub } from './components/operations/GovernmentOperationsHub';
import { GovernmentUser, DEMO_GOVERNMENT_OFFICERS } from './services/auth/rbacEngine';
import { Map, Activity, TrendingUp, Cpu, Sliders, Radio, ShieldAlert, Building, GitCompare } from 'lucide-react';
import { DataComparisonView } from './components/operations/DataComparisonView';

export default function App() {
  const { districtsData, isLiveActive, isLoadingLive } = useLiveEnvironmentalData();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentDisease, setCurrentDisease] = useState<DiseaseType>('ADD');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null); 
  const [activeTab, setActiveTab] = useState<'map' | 'operations' | 'comparison' | 'detail' | 'trends' | 'performance' | 'simulator'>('map');
  const [currentUser, setCurrentUser] = useState<GovernmentUser>(DEMO_GOVERNMENT_OFFICERS[0]);

  // Synchronize authenticated government officer on mount
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Update selected district when live data loads if none selected
  useEffect(() => {
    if (districtsData.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districtsData[0]);
    }
  }, [districtsData, selectedDistrict]);

  const [globeControls, setGlobeControls] = useState<GlobeControlsState>({
    autoRotate: true,
    rotationSpeed: 1.0,
    atmosphereGlow: true,
    nightLights: true,
    showClouds: true,
    showDistrictMarkers: true,
    showRivers: true,
    cameraPreset: 'india',
  });

  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  // Handle selecting a district
  const handleSelectDistrict = (district: DistrictData) => {
    setSelectedDistrict(district);
  };

  // Handle Focus district action from table
  const handleFocusGlobeDistrict = (district: DistrictData) => {
    setSelectedDistrict(district);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle clicking an alert in notification bell popover
  const handleSelectAlertDistrict = (districtId: string) => {
    const found = districtsData.find((d) => d.id === districtId);
    if (found) {
      setSelectedDistrict(found);
      setActiveTab('detail');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient Sci-Fi Obsidian Cyan Glow Backdrops */}
      <div className="fixed top-0 left-1/4 w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Astro Title Opening Entrance Video Splash Component */}
      {showSplash && (
        <AstroSplashIntro onGetStarted={() => setShowSplash(false)} />
      )}

      {/* Top Header Navigation */}
      <Header
        currentDisease={currentDisease}
        onSelectDisease={setCurrentDisease}
        alerts={RECENT_ALERTS}
        globeControls={globeControls}
        onUpdateGlobeControls={setGlobeControls}
        onOpenDeveloperPrompt={() => setIsPromptOpen(true)}
        onOpenDataProvenance={() => setIsProvenanceOpen(true)}
        onSelectAlertDistrict={handleSelectAlertDistrict}
        onReplaySplash={() => setShowSplash(true)}
        onOpenComparison={() => setActiveTab('comparison')}
        isLiveActive={isLiveActive}
        isLoadingLive={isLoadingLive}
        currentUser={currentUser}
        onUserChanged={setCurrentUser}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-800/80'
            }`}
          >
            <Map className="w-4 h-4 text-cyan-300" />
            Interactive Risk Map (2D GIS)
          </button>

          <button
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'operations'
                ? 'bg-gradient-to-r from-red-500 via-amber-500 to-cyan-500 text-white shadow-lg shadow-amber-500/30 border border-amber-300/40 scale-105'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-800/80'
            }`}
          >
            <Building className="w-4 h-4 text-amber-400" />
            Operations Command Center
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/30 border border-red-400/50 text-red-200 font-mono">
              Gov Ops
            </span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-500 text-white shadow-lg shadow-indigo-500/30 border border-cyan-300/40 scale-105 ring-1 ring-cyan-300'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-800/80'
            }`}
          >
            <GitCompare className="w-4 h-4 text-cyan-300" />
            Old vs New Data Comparison
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 font-mono">
              Diffs
            </span>
          </button>

          <button
            onClick={() => setActiveTab('detail')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'detail'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-800/80'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            District Detail Analytics
            {selectedDistrict && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 font-mono">
                {selectedDistrict.name}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'trends'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-800/80'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Monsoon Trends
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'performance'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-800/80'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-300" />
            XGBoost ML Metrics
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-300/40 scale-105'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-slate-800/80'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            What-If Simulator
          </button>
        </div>

        {/* Tab Content Rendering */}
        <section className="pt-2">
          {activeTab === 'map' && (
            <RiskMapOverview
              districts={districtsData}
              disease={currentDisease}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              onFocusGlobeDistrict={handleFocusGlobeDistrict}
              onNavigateComparison={() => setActiveTab('comparison')}
            />
          )}

          {activeTab === 'operations' && (
            <GovernmentOperationsHub
              currentUser={currentUser}
              onNavigateTab={(t) => {
                if (t === 'map' || t === 'detail' || t === 'trends' || t === 'performance' || t === 'simulator' || t === 'operations' || t === 'comparison') {
                  setActiveTab(t as any);
                }
              }}
              onSelectDistrict={(id) => {
                const found = districtsData.find((d) => d.id === id);
                if (found) setSelectedDistrict(found);
              }}
            />
          )}

          {activeTab === 'comparison' && (
            <DataComparisonView
              currentUser={currentUser}
              initialDisease={currentDisease}
              onSelectDistrict={(id) => {
                const found = districtsData.find((d) => d.id === id);
                if (found) {
                  setSelectedDistrict(found);
                  setActiveTab('detail');
                }
              }}
              onNavigateTab={(t) => {
                if (t === 'map' || t === 'detail' || t === 'trends' || t === 'performance' || t === 'simulator' || t === 'operations' || t === 'comparison') {
                  setActiveTab(t as any);
                }
              }}
            />
          )}

          {activeTab === 'detail' && (
            <DistrictDetailView 
              district={selectedDistrict} 
              allDistricts={districtsData} 
              onSelectDistrict={handleSelectDistrict}
              onNavigateTab={(t) => setActiveTab(t as any)}
            />
          )}

          {activeTab === 'trends' && (
            <TrendsView districts={districtsData} disease={currentDisease} />
          )}

          {activeTab === 'performance' && (
            <ModelPerformanceView currentDisease={currentDisease} />
          )}

          {activeTab === 'simulator' && (
            <SimulatorView disease={currentDisease} />
          )}
        </section>
      </main>

      {/* Modals */}
      <DataProvenancePanel isOpen={isProvenanceOpen} onClose={() => setIsProvenanceOpen(false)} />
      <DeveloperPromptModal isOpen={isPromptOpen} onClose={() => setIsPromptOpen(false)} />
    </div>
  );
}
