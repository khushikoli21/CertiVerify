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
  QrCode
} from 'lucide-react';
import { DEFAULT_API_BASE_URL, DEFAULT_S3_WEBSITE_URL, getApiBaseUrl, getS3WebsiteUrl } from '../config.ts';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
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

      // Whether it's 200 or 404, if fetch succeeds, API Gateway and CORS are active!
      setTestResult({
        success: true,
        status: res.status,
        message: `Connected successfully! AWS API Gateway responded with HTTP ${res.status}. CORS headers are accepted.`
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
    if (apiUrl.trim()) {
      sessionStorage.setItem('certiverify_runtime_api_url', apiUrl.trim());
    } else {
      sessionStorage.removeItem('certiverify_runtime_api_url');
    }

    if (s3Url.trim()) {
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
    setTestResult(null);
    onConfigUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                AWS Connection & S3 Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configure API Gateway Invoke URL and S3 hosting domain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Gateway Invoke URL Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
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
            <span>Defined in <code className="font-mono text-slate-700">src/config.ts</code></span>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              <span>Test Connection</span>
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
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
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
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
            Used as the target URL when generating QR codes: <code className="font-mono text-slate-700">{"{S3_WEBSITE_URL}/?id=CERTIFICATE_ID"}</code>.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Reset to Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
