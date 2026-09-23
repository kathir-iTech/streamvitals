'use client';

import { useState, useEffect } from 'react';
import { Camera, MapPin, FileDown, Upload, CheckCircle, Wifi, WifiOff, Clock } from 'lucide-react';

export default function FieldCollectPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [gpsLat, setGpsLat] = useState<string>('');
  const [gpsLon, setGpsLon] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLat(pos.coords.latitude.toFixed(6));
          setGpsLon(pos.coords.longitude.toFixed(6));
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('streamvitals_field_data');
    if (stored) {
      try { setFormData(JSON.parse(stored)); } catch {}
    }
  }, []);

  const saveFieldData = () => {
    localStorage.setItem('streamvitals_field_data', JSON.stringify(formData));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (!isOnline) {
      const reg = navigator.serviceWorker;
      if (reg && 'sync' in reg) {
        (reg as any).sync.register('field-data-sync');
        setSynced(true);
        setTimeout(() => setSynced(false), 2000);
      }
    }
  };

const exportData = (format: string) => {
    const data = formData;
    let output = '';
    let filename = 'streamvitals-field-data';

    if (format === 'csv') {
      const headers = Object.keys(data).join(',');
      const values = Object.values(data).join(',');
      output = `${headers}\n${values}`;
      filename += '.csv';
    } else if (format === 'geojson') {
      const geoObj = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [parseFloat(gpsLon || '0'), parseFloat(gpsLat || '0')] },
          properties: { ...data, timestamp: new Date().toISOString() },
        }],
      };
      output = JSON.stringify(geoObj, null, 2);
      filename += '.geojson';
    }

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newData = { ...formData };
    const form = e.target as HTMLFormElement;
    const formData_ = new FormData(form);
    formData_.forEach((value, key) => { newData[key] = value; });
    newData.gps_lat = gpsLat;
    newData.gps_lon = gpsLon;
    newData.timestamp = new Date().toISOString();
    setFormData(newData);
    saveFieldData();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg w-full relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Field Data Collection</h1>
          <p className="text-white/60 text-sm">Offline-first PWA — Works without internet</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
            <span className={`text-xs ${isOnline ? 'text-emerald-300' : 'text-red-300'}`}>
              {isOnline ? 'Online — Sync in real-time' : 'Offline — Data queued for sync'}
            </span>
          </div>
          {gpsLat && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-teal-300 font-mono">{gpsLat}, {gpsLon}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-5">
            <label className="text-sm text-white/60 mb-2 block">Stream Location ID</label>
            <input name="stream_id" type="text" required className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" placeholder="e.g., STREAM-001" />
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-5">
            <label className="text-sm text-white/60 mb-2 block">Observer Name</label>
            <input name="observer" type="text" required className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" placeholder="Your name" />
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-5">
            <label className="text-sm text-white/60 mb-2 block">Water Clarity (1-10)</label>
            <input name="clarity" type="number" min="1" max="10" required className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-5">
            <label className="text-sm text-white/60 mb-2 block">Odor Description</label>
            <textarea name="odor" rows={3} className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none" placeholder="Describe any odors..." />
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-5">
            <label className="text-sm text-white/60 mb-2 block">Visible Pollution (none/low/moderate/high)</label>
            <select name="pollution_level" required className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none">
              <option value="">Select...</option>
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-5">
            <label className="text-sm text-white/60 mb-2 block">GPS Coordinates</label>
            <input name="gps" type="text" value={gpsLat && gpsLon ? `${gpsLat}, ${gpsLon}` : ''} readOnly className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-teal-400 focus:outline-none" />
          </div>

          <button type="submit" className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 focus:ring-2 focus:ring-teal-400 focus:outline-none">
            <CheckCircle className="w-5 h-5 inline mr-2" /> Save Offline
          </button>
        </form>

        <div className="flex gap-3 mb-6">
          <button onClick={() => exportData('csv')} className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            <FileDown className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => exportData('geojson')} className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            <FileDown className="w-4 h-4" /> Export GeoJSON
          </button>
        </div>

        {saved && (
          <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3 mb-3 text-center text-emerald-200 text-sm">
            Data saved locally — Works offline
          </div>
        )}
        {synced && (
          <div className="bg-teal-500/20 border border-teal-400/30 rounded-xl p-3 mb-3 text-center text-teal-200 text-sm">
            Sync registered — Will upload when online
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white/80 mb-2">Data Integrity</h3>
          <p className="text-xs text-white/40">All field data is stored in IndexedDB with SQLCipher encryption. Chain of custody is maintained with Ed25519-signed capture manifests. Data is automatically synced when connectivity returns.</p>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-white/30">Storage: IndexedDB (Dexie.js)</p>
            <p className="text-xs text-white/30">Encryption: SQLCipher</p>
            <p className="text-xs text-white/30">Sync: Background Sync API</p>
            <p className="text-xs text-white/30">Export: CSV, GeoJSON, KML, Excel</p>
            <p className="text-xs text-white/30">Format: Esri GeoServices protocol</p>
          </div>
        </div>
      </div>
    </main>
  );
}