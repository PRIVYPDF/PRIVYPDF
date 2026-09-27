import React, { useState } from 'react';
import { Lock, Download, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { evaluatePasswordStrength, protectPdfDocument } from '../services/encryption/pdfProtection';
import { downloadFile, triggerConfetti } from '../utils/fileUtils';

export const ProtectPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);
  const [isProtecting, setIsProtecting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(password);
  const isMatch = password === confirmPassword && password.length > 0;

  const handleFileLoaded = (loadedFile: File, loadedBuffer: ArrayBuffer) => {
    setFile(loadedFile);
    setBuffer(loadedBuffer);
    setNotice(null);
    setErrorMessage(null);
  };

  const handleProtect = async () => {
    if (!buffer || !isMatch) return;
    try {
      setIsProtecting(true);
      setErrorMessage(null);
      const { protectedBytes, notice: protectionNotice } = await protectPdfDocument(
        buffer,
        password,
        { allowPrinting, allowCopying, allowModifying }
      );

      setNotice(protectionNotice);
      const outName = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-protected.pdf`;
      downloadFile(protectedBytes, outName);
      triggerConfetti();
    } catch (err: any) {
      console.error('Error applying PDF protection:', err);
      setErrorMessage(err?.message || 'Something went wrong while applying password protection. Please try again.');
    } finally {
      setIsProtecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Local Document Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Protect PDF Document
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Set document passwords and restrict permissions directly in your browser without uploading to external servers.
        </p>
      </div>

      {!buffer ? (
        <DropZone
          onFileLoaded={handleFileLoaded}
          title="Drop your PDF here to protect"
          subtitle="or click to browse your local device"
        />
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 max-w-xl mx-auto">
          {/* File Selected Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700 truncate max-w-xs">{file?.name}</span>
            <button
              type="button"
              onClick={() => { setBuffer(null); setFile(null); }}
              className="text-xs text-indigo-600 font-semibold hover:underline min-h-[32px] flex items-center"
            >
              Change
            </button>
          </div>

          {/* Password fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Set Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 pr-10 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={`font-bold ${
                      strength.score <= 1 ? 'text-rose-600' : strength.score <= 3 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all ${
                          strength.score > step
                            ? strength.score <= 1
                              ? 'bg-rose-500'
                              : strength.score <= 3
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.feedback.length > 0 && (
                    <p className="text-[11px] text-slate-400">
                      Recommendation: {strength.feedback.join(' • ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 min-h-[44px] ${
                  confirmPassword && !isMatch
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-indigo-500'
                } focus:outline-none focus:ring-2`}
              />
              {confirmPassword && !isMatch && (
                <p className="text-xs text-rose-500 mt-1 font-medium">Passwords do not match.</p>
              )}
            </div>
          </div>

          {/* Permissions Options */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Document Permissions
            </span>
            <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={allowPrinting}
                onChange={(e) => setAllowPrinting(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 shrink-0"
              />
              <span>Allow high-resolution printing</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={allowCopying}
                onChange={(e) => setAllowCopying(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 shrink-0"
              />
              <span>Allow content copying / text extraction</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={allowModifying}
                onChange={(e) => setAllowModifying(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 shrink-0"
              />
              <span>Allow page modification & form filling</span>
            </label>
          </div>

          {/* Transparent Guarantee Callout */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero-Transmission Architecture</span>
            </div>
            <p>
              Your password and PDF never leave this browser tab. We never store, transmit, or record passwords.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleProtect}
              disabled={isProtecting || !isMatch}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
            >
              {isProtecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>Applying Protection...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Protect & Download PDF</span>
                </>
              )}
            </button>
          </div>

          {notice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
