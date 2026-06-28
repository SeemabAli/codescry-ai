export default function SettingsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-cyan-300">Settings</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Account settings
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Manage your profile and CodeScry AI preferences.
        </p>
      </div>

      <div className="mt-10 max-w-2xl rounded-3xl border border-white/10 bg-white/3 p-6">
        <h2 className="text-xl font-semibold">Profile</h2>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Full name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Your name"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <button
            type="button"
            className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="mt-6 max-w-2xl rounded-3xl border border-white/10 bg-white/3 p-6">
        <h2 className="text-xl font-semibold">AI Preferences</h2>

        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
            <input type="checkbox" defaultChecked className="mt-1" />

            <div>
              <p className="text-sm font-medium text-white">
                Enable beginner-friendly explanations
              </p>

              <p className="mt-1 text-sm text-slate-500">
                AI will explain issues in simple terms.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
            <input type="checkbox" defaultChecked className="mt-1" />

            <div>
              <p className="text-sm font-medium text-white">
                Include improved code
              </p>

              <p className="mt-1 text-sm text-slate-500">
                AI will generate a refactored version of submitted code.
              </p>
            </div>
          </label>
        </div>
      </div>
    </>
  );
}