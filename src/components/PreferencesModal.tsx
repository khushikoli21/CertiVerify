import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Globe, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Sliders, 
  Bell, 
  LayoutList 
} from 'lucide-react';
import { UiPreferences } from '../types.ts';
import { DEFAULT_API_BASE_URL, DEFAULT_S3_WEBSITE_URL, getApiBaseUrl, getS3WebsiteUrl } from '../config.ts';

interface PreferencesModalProps {
  isOpen: boolean;
  preferences: UiPreferences;
  onClose: () => void;
  onSavePreferences: (updated: UiPreferences) => void;
  onConfigUpdated: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  preferences,
  onClose,
  onSavePreferences,
  onConfigUpdated
}) => {
  // UI preferences
  const [density, setDensity] = useState<'comfortable' | 'compact'>(preferences.tableDensity);
  const [notifications, setNotifications] = useState(preferences.notificationsEnabled);

  // AWS endpoints
  const [apiUrl, setApiUrl] = useState(() => getApiBaseUrl());
  const [s3Url, setS3Url] = useState(() => getS3WebsiteUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    status?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const testEndpoint = `${apiUrl.trim().replace(/\/+$/, '')}/verify?id=health-check-probe`;

    try {
      const res = await fetch(testEndpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      setTestResult({
        success: true,
        status: res.status,
        message: `Connected successfully! AWS API Gateway responded with HTTP ${res.status}. CORS headers accepted.`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: `Failed to connect: ${msg}. Check endpoint URL and API Gateway CORS configuration.`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    // Save UI preferences
    onSavePreferences({
      ...preferences,
      tableDensity: density,
      notificationsEnabled: notifications
    });

    // Save AWS endpoint overrides if provided
    if (apiUrl.trim() && apiUrl !== DEFAULT_API_BASE_URL) {
      sessionStorage.setItem('certiverify_runtime_api_url', apiUrl.trim());
    } else {
      sessionStorage.removeItem('certiverify_runtime_api_url');
    }

    if (s3Url.trim() && s3Url !== DEFAULT_S3_WEBSITE_URL) {
      sessionStorage.setItem('certiverify_runtime_s3_url', s3Url.trim());
    } else {
      sessionStorage.removeItem('certiverify_runtime_s3_url');
    }

    onConfigUpdated();
    onClose();
  };

  const handleResetDefaults = () => {
    sessionStorage.removeItem('certiverify_runtime_api_url');
    sessionStorage.removeItem('certiverify_runtime_s3_url');
    setApiUrl(DEFAULT_API_BASE_URL);
    setS3Url(DEFAULT_S3_WEBSITE_URL);
    setDensity('comfortable');
    setNotifications(true);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Platform Preferences & AWS Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configure UI density, notification toasts, and AWS endpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: UI Preferences */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutList className="w-4 h-4 text-blue-600" />
            <span>UI & Table Settings</span>
          </h3>

          {/* Table Density */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-800">Table Density</div>
              <div className="text-[11px] text-slate-500">Controls row height and spacing across data tables</div>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  density === 'comfortable' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  density === 'compact' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Compact
              </button>
            </div>
          </div>

          {/* Toast Notifications */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-600" />
                <span>Action Toasts</span>
              </div>
              <div className="text-[11px] text-slate-500">Display temporary popup banners for verify/register/revoke outcomes</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Section 2: AWS Endpoints */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-purple-600" />
            <span>AWS API Gateway & S3 Configuration</span>
          </h3>

          {/* API Gateway Invoke URL Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Amazon API Gateway Invoke URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Server className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://xxx.execute-api.region.amazonaws.com/prod"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Configured constant in <code className="font-mono text-slate-700">src/config.ts</code></span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span>Test AWS Connection</span>
              </button>
            </div>
          </div>

          {/* Test Result Display */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">
                  {testResult.success ? 'Connection Verified' : 'Connection Failed'}
                </span>
                <p className="mt-0.5 text-[11px] leading-relaxed">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* S3 Website URL Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Amazon S3 Static Website Hosting URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={s3Url}
                onChange={(e) => setS3Url(e.target.value)}
                placeholder="http://your-bucket-name.s3-website.region.amazonaws.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Target domain encoded in generated QR codes. Defaults dynamically to <code className="font-mono text-slate-700">window.location.origin</code> when deployed.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            Reset to Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Save Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
