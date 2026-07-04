import React, { useState, useEffect } from 'react';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import { fetchAndParseData } from './utils/dataParser';
import { Map, BarChart2, Loader2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('page1');
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAndParseData();
        setGeoData(data);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#00E5FF] mb-4" />
        <h2 className="text-xl font-bold tracking-wide">Loading Dataset...</h2>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#0B0F19]">
      
      {/* Lightweight Navigation Bar */}
      <nav className="h-14 border-b border-gray-800 bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-between px-6 z-50 relative shrink-0">
        <div className="flex items-center gap-2 text-white font-bold text-lg tracking-wide">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00E5FF] to-[#FFB300] flex items-center justify-center text-[#0B0F19]">
            <Map size={20} />
          </div>
          CuisineGeo Engine
        </div>
        
        <div className="flex bg-[#12182B] p-1 rounded-lg border border-gray-800">
          <button 
            onClick={() => setActiveTab('page1')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'page1' ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <Map size={16} /> WebGL Canvas
          </button>
          <button 
            onClick={() => setActiveTab('page2')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'page2' ? 'bg-[#FFB300]/10 text-[#FFB300] border border-[#FFB300]/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <BarChart2 size={16} /> Bias Auditor
          </button>
        </div>
      </nav>

      {/* Main Content Area - Using CSS display for zero-lag transitions */}
      <main className="flex-1 relative w-full h-full min-h-0">
        <div className="absolute inset-0 w-full h-full" style={{ display: activeTab === 'page1' ? 'block' : 'none' }}>
          <Page1 geoData={geoData} />
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ display: activeTab === 'page2' ? 'block' : 'none' }}>
          <Page2 geoData={geoData} />
        </div>
      </main>

    </div>
  );
}

export default App;
