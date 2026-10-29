import React, { useState } from 'react';
import { AppSettings } from '../types/index.ts';
import { Settings, Save, ShieldCheck, Printer, Key, CheckCircle, Info } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings }) => {
  const [dateFormat, setDateFormat] = useState<'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY'>(
    settings.dateFormat || 'DD/MM/YYYY'
  );
  const [companyName, setCompanyName] = useState(settings.companyName || 'Modern National Chemicals (MNChem)');
  const [companyAddress, setCompanyAddress] = useState(
    settings.companyAddress || 'Dammam 2nd Industrial City, Eastern Province, KSA'
  );
  const [companyWebsite, setCompanyWebsite] = useState(settings.companyWebsite || 'www.mn-chem.com');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSaveSettings({
        dateFormat,
        companyName,
        companyAddress,
        companyWebsite,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-[#00a3e0]" />
          <h1 className="text-2xl font-black text-white tracking-tight">System & Print Settings</h1>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Configure label formatting preferences, organizational branding metadata, and printing guidelines.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Settings updated successfully. All subsequent generated labels will use these preferences.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Format Card */}
        <div className="bg-[#0b284e]/80 border border-[#163e72] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#163e72]">
            <Printer className="w-5 h-5 text-[#00a3e0]" />
            <h2 className="text-base font-bold text-white">Label Date Format Configuration</h2>
          </div>

          <p className="text-xs text-slate-300">
            Select the standard calendar date format displayed on printed packaging labels and chemical compliance boxes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK / KSA Standard)', sample: '28/10/2026' },
              { id: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (Alpha Month)', sample: '28-OCT-2026' },
              { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO 8601)', sample: '2026-10-28' },
            ].map((fmt) => (
              <label
                key={fmt.id}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  dateFormat === fmt.id
                    ? 'bg-[#00a3e0]/15 border-[#00a3e0] text-white ring-1 ring-[#00a3e0]'
                    : 'bg-[#061833] border-[#1c4880] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{fmt.label}</span>
                    <input
                      type="radio"
                      name="dateFormat"
                      value={fmt.id}
                      checked={dateFormat === fmt.id}
                      onChange={() => setDateFormat(fmt.id as any)}
                      className="text-[#00a3e0] focus:ring-[#00a3e0]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">Sample output:</p>
                  <p className="text-sm font-mono font-bold text-cyan-300 mt-0.5">{fmt.sample}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Company Organization Card */}
        <div className="bg-[#0b284e]/80 border border-[#163e72] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#163e72]">
            <Info className="w-5 h-5 text-[#00a3e0]" />
            <h2 className="text-base font-bold text-white">Company Facility Identification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Facility Website</label>
              <input
                type="text"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Facility Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#061833] border border-[#1c4880] rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Security & Access Code Info */}
        <div className="bg-[#0b284e]/80 border border-[#163e72] rounded-xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#163e72]">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Access Gate & Environment Configuration</h2>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p>
              Current Access Gate: Initial deployment code is active (<code className="bg-[#061833] text-amber-300 px-1.5 py-0.5 rounded font-mono">3056</code>).
            </p>
            <p>
              To change or rotate this access code in production, set the server environment variable:
            </p>
            <div className="bg-[#040e1d] p-3 rounded-lg border border-[#163e72] font-mono text-[11px] text-cyan-300">
              LABEL_APP_ACCESS_CODE="your-new-secure-code"
            </div>
            <p className="text-slate-400 text-[11px]">
              The access code is verified exclusively on the server and is never transmitted or exposed in frontend client bundles.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#00a3e0] hover:bg-[#028ec5] text-white font-bold text-sm shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};
