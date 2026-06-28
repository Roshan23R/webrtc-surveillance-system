import { FormEvent } from "react";

interface AuthPageProps {
  isLogin: boolean;
  authUsername: string;
  authPassword: string;
  authError: string;
  authSuccess: string;
  authLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onToggleMode: () => void;
}

export function AuthPage({
  isLogin,
  authUsername,
  authPassword,
  authError,
  authSuccess,
  authLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}: AuthPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/30">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-50 tracking-tight">
          {isLogin ? "Sign in to Surveillance System" : "Create your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Or{" "}
          <button
            onClick={onToggleMode}
            className="font-medium text-violet-500 hover:text-violet-400 cursor-pointer"
          >
            {isLogin ? "create a new account" : "log in to existing account"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 border border-zinc-800/80 py-8 px-4 shadow-2xl rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-2xl text-xs font-semibold">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl text-xs font-semibold">
                {authSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Username
              </label>
              <div className="mt-1.5">
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-zinc-800 bg-zinc-950 rounded-2xl text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all text-white"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-zinc-800 bg-zinc-950 rounded-2xl text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all text-white"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {authLoading
                  ? "Authenticating..."
                  : isLogin
                    ? "Sign In"
                    : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
