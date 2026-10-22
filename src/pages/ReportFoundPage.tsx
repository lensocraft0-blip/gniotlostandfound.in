import React, { useState, useEffect } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import {
  GNIOT_CAMPUS_LOCATIONS,
  GNIOT_CAMPUS_ZONES,
  ITEM_CATEGORIES,
  ITEM_COLORS,
} from '../config/campus';
import { saveReportDraft, getSavedDrafts, removeReportDraft } from '../lib/offline';
import { ItemCategory, ContactPreference } from '../types/database';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Camera,
} from 'lucide-react';

interface ReportFoundPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const ReportFoundPage: React.FC<ReportFoundPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [draftId] = useState(`draft-found-${Date.now()}`);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Phones & Electronics');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('Black');
  const [campusLocation, setCampusLocation] = useState<string>(GNIOT_CAMPUS_LOCATIONS[0]);
  const [campusZone, setCampusZone] = useState<string>(GNIOT_CAMPUS_ZONES[0]);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('15:00');
  const [contactPreference, setContactPreference] = useState<ContactPreference>('helpdesk');
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [imageFiles, setImageFiles] = useState<string[]>([]);

  const [savingDraft, setSavingDraft] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getSavedDrafts().find((d) => d.report_type === 'found');
    if (existing) {
      setTitle(existing.title || '');
      if (existing.category) setCategory(existing.category as ItemCategory);
      setDescription(existing.description || '');
      setBrand(existing.brand || '');
      setColor(existing.color || 'Black');
      if (existing.campus_location) setCampusLocation(existing.campus_location);
      if (existing.campus_zone) setCampusZone(existing.campus_zone);
      if (existing.event_date) setEventDate(existing.event_date);
      if (existing.event_time) setEventTime(existing.event_time);
      if (existing.private_verification_question) setVerificationQuestion(existing.private_verification_question);
      if (existing.private_verification_answer) setVerificationAnswer(existing.private_verification_answer);
      if (existing.image_previews) setImageFiles(existing.image_previews);
      setDraftRestored(true);
    }
  }, []);

  const handleSaveDraft = () => {
    setSavingDraft(true);
    saveReportDraft({
      id: draftId,
      report_type: 'found',
      title,
      category,
      description,
      brand,
      color,
      campus_location: campusLocation,
      campus_zone: campusZone,
      event_date: eventDate,
      event_time: eventTime,
      contact_preference: contactPreference,
      private_verification_question: verificationQuestion,
      private_verification_answer: verificationAnswer,
      image_previews: imageFiles,
    });
    setTimeout(() => setSavingDraft(false), 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageFiles((prev) => [...prev, reader.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !campusLocation) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await DataService.createItem({
        owner_id: user?.id || 'anonymous-user',
        owner_name: user?.display_name || 'GNIOT Good Samaritan',
        report_type: 'found',
        title,
        category,
        description,
        brand: brand || undefined,
        color,
        campus_location: campusLocation,
        campus_zone: campusZone,
        event_date: eventDate,
        event_time: eventTime,
        reported_at: new Date().toISOString(),
        image_paths: imageFiles,
        status: 'open',
        contact_preference: contactPreference,
        private_verification_question: verificationQuestion || undefined,
        private_verification_answer: verificationAnswer || undefined,
      });

      removeReportDraft(draftId);
      onNavigate('item_details', created.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting found item report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-6 pb-16 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-[#BFC8D2] hover:text-[#E8EDF2]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={handleSaveDraft}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#BFC8D2] hover:text-[#E8EDF2] hover:bg-[#30152F] transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-[#D9A441]" />
          <span>{savingDraft ? 'Saved to Device' : 'Save Draft (Offline)'}</span>
        </button>
      </div>

      {draftRestored && (
        <div className="p-3 rounded-xl bg-[#30152F]/60 border border-[#D9A441]/30 text-xs text-[#E8EDF2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D9A441]" />
            <span>Restored saved draft from local storage.</span>
          </div>
          <button
            onClick={() => setDraftRestored(false)}
            className="text-[11px] text-[#BFC8D2] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="rounded-2xl glass-card border border-[#E8EDF2]/15 p-6 sm:p-8 bg-[#1D1020]/90 shadow-2xl space-y-6">
        <div>
          <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            Step {step} of 3 · Found Belonging Registration
          </span>
          <h1 className="text-2xl font-bold font-display text-[#E8EDF2] mt-1">
            Report a Found Item
          </h1>
          <p className="text-xs text-[#BFC8D2] mt-1">
            Help return an item to its owner. Set private verification questions so only the rightful owner can claim it.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-emerald-400' : 'bg-[#E8EDF2]/15'}`} />
          <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-emerald-400' : 'bg-[#E8EDF2]/15'}`} />
          <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-emerald-400' : 'bg-[#E8EDF2]/15'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">
                  Item Title * (e.g. Set of 3 Brass Keys on Leather Keychain)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Describe the item concisely"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#E8EDF2] font-medium mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                  >
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#E8EDF2] font-medium mb-1">Color *</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                  >
                    {ITEM_COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">Brand (If Visible)</label>
                <input
                  type="text"
                  placeholder="e.g. Dell, Boat, Nike, Casio"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mention general condition. Do not reveal private secret markings (use Step 3 for verification questions)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!title || !description) {
                      setError('Title and description are required.');
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-emerald-400 text-[#1D1020] font-semibold text-xs hover:bg-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <span>Next: Location Found</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">
                  Where on Campus was it Found? *
                </label>
                <select
                  value={campusLocation}
                  onChange={(e) => setCampusLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                >
                  {GNIOT_CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">Campus Zone</label>
                <select
                  value={campusZone}
                  onChange={(e) => setCampusZone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                >
                  {GNIOT_CAMPUS_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#E8EDF2] font-medium mb-1">Date Found</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#E8EDF2] font-medium mb-1">Approximate Time</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#BFC8D2] hover:text-[#E8EDF2]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-lg bg-emerald-400 text-[#1D1020] font-semibold text-xs hover:bg-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <span>Next: Verification &amp; Safekeeping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#30152F]/40 border border-[#D9A441]/30 space-y-2">
                <div className="flex items-center gap-1.5 text-[#D9A441] font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Private Claim Verification (Anti-Fraud)</span>
                </div>
                <p className="text-[#BFC8D2] text-[11px] leading-relaxed">
                  To prevent unauthorized people from claiming this item, set a secret question only the true owner would know.
                </p>

                <div>
                  <label className="block text-[#E8EDF2] font-medium mb-1">
                    Public Verification Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. What is the wallpaper image on the phone screen?"
                    value={verificationQuestion}
                    onChange={(e) => setVerificationQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#E8EDF2] font-medium mb-1">
                    Private Answer (Confidential — Stored Securely)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Anime Goku wallpaper with cracked bottom glass"
                    value={verificationAnswer}
                    onChange={(e) => setVerificationAnswer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">
                  Item Photos (Optional - Max 3)
                </label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {imageFiles.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#E8EDF2]/20 bg-[#130b15]"
                    >
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {imageFiles.length < 3 && (
                    <label className="w-24 h-24 rounded-lg border-2 border-dashed border-[#E8EDF2]/20 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center cursor-pointer bg-[#30152F]/20 text-[#BFC8D2]">
                      <Camera className="w-6 h-6 text-emerald-400 mb-1" />
                      <span className="text-[10px]">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">Current Holding Location</label>
                <select
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value as ContactPreference)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                >
                  <option value="helpdesk">Handed Over to Gate 1 Campus Security Desk (Recommended)</option>
                  <option value="in_app">Holding personally (In-App verification required before handoff)</option>
                  <option value="email">Holding personally (Institutional Email routing)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#BFC8D2] hover:text-[#E8EDF2]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-emerald-400 text-[#1D1020] font-semibold text-xs hover:bg-emerald-300 transition-colors flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <span>{submitting ? 'Registering Found Item...' : 'Publish Found Report'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
