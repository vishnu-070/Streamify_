import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShipWheelIcon, CameraIcon, LoaderIcon } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Japanese', 'Korean', 'Chinese (Mandarin)', 'Chinese (Cantonese)',
  'Arabic', 'Hindi', 'Bengali', 'Dutch', 'Swedish', 'Polish', 'Turkish',
  'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Greek', 'Czech', 'Romanian',
  'Hungarian', 'Finnish', 'Norwegian', 'Danish', 'Ukrainian', 'Hebrew',
  'Swahili', 'Filipino', 'Other',
];

const OnboardingPage = () => {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: authUser?.fullName || '',
    bio: '',
    nativeLanguage: '',
    LearningLanguage: '',
    Location: '',
    profilePic: authUser?.profilePic || '',
  });

  const { mutate: onboard, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post('/auth/onboarding', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user);
      toast.success('Profile completed! Welcome to Streamify 🎉');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Onboarding failed';
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nativeLanguage || !form.LearningLanguage) {
      toast.error('Please select both native and learning languages');
      return;
    }
    onboard(form);
  };

  return (
    <div data-theme="emerald" className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 shadow-2xl border border-base-300 w-full max-w-2xl">
        <div className="card-body p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <ShipWheelIcon className="size-8 text-primary" />
            <span className="text-2xl font-bold font-mono text-primary">Streamify</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Complete Your Profile</h1>
          <p className="text-base-content/60 text-sm mb-6">
            Tell us about yourself so we can find your perfect language partners
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={form.profilePic || authUser?.profilePic} alt="Profile" />
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Profile Photo</p>
                <p className="text-xs text-base-content/50">Auto-assigned — you can update it later</p>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">Full Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full bg-base-100"
                placeholder="Your full name"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>

            {/* Location */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">Location</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full bg-base-100"
                placeholder="e.g. Tokyo, Japan"
                value={form.Location}
                onChange={(e) => setForm((f) => ({ ...f, Location: e.target.value }))}
                required
              />
            </div>

            {/* Languages row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">Native Language</span>
                </label>
                <select
                  className="select select-bordered bg-base-100 w-full"
                  value={form.nativeLanguage}
                  onChange={(e) => setForm((f) => ({ ...f, nativeLanguage: e.target.value }))}
                  required
                >
                  <option value="" disabled>Select language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">Learning Language</span>
                </label>
                <select
                  className="select select-bordered bg-base-100 w-full"
                  value={form.LearningLanguage}
                  onChange={(e) => setForm((f) => ({ ...f, LearningLanguage: e.target.value }))}
                  required
                >
                  <option value="" disabled>Select language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">About Me</span>
              </label>
              <textarea
                className="textarea textarea-bordered bg-base-100 w-full resize-none"
                rows={3}
                placeholder="Tell potential language partners a little about yourself..."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full rounded-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  Saving profile...
                </>
              ) : (
                'Complete Profile & Get Started 🚀'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;