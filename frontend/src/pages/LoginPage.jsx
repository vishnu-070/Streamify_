import { useState } from 'react';
import { Link } from 'react-router';
import { ShipWheelIcon, EyeIcon, EyeOffIcon, LoaderIcon } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '', agreedToTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isPending } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.agreedToTerms) return;
    login({ email: form.email, password: form.password });
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="flex rounded-2xl overflow-hidden w-full max-w-4xl bg-base-200 shadow-2xl border border-base-300">
        {/* LEFT PANEL — Form */}
        <div className="flex-1 p-8 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
          <p className="text-base-content/60 text-sm mb-6">
            Sign in to continue your language learning journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full bg-base-100 focus:input-primary"
                placeholder="hello@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full bg-base-100 focus:input-primary pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="form-control">
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm shrink-0"
                  checked={form.agreedToTerms}
                  onChange={(e) => setForm((f) => ({ ...f, agreedToTerms: e.target.checked }))}
                />
                <span className="label-text text-sm select-none text-left">
                  I agree to the{' '}
                  <span className="text-primary hover:underline font-semibold">terms of service</span>{' '}
                  and{' '}
                  <span className="text-primary hover:underline font-semibold">privacy policy</span>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full rounded-full mt-2"
              disabled={isPending || !form.agreedToTerms}
            >
              {isPending ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* RIGHT PANEL — Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-1 bg-primary/10 p-10 text-center relative overflow-hidden">
          <div className="absolute w-64 h-64 rounded-full bg-primary/20 -top-10 -right-10" />
          <div className="absolute w-48 h-48 rounded-full bg-secondary/20 -bottom-5 -left-5" />

          <div className="relative z-10 mb-6">
            <div className="w-52 h-52 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <div className="w-40 h-40 rounded-full bg-primary/30 flex items-center justify-center">
                <ShipWheelIcon className="size-20 text-primary opacity-80" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-base-content mb-3 relative z-10">
            Connect with language partners worldwide
          </h2>
          <p className="text-base-content/60 text-sm relative z-10 max-w-xs">
            Practice conversations, make friends, and improve your language skills together
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;