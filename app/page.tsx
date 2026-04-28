export default function Page() {
  const [tab, setTab] = useState<Tab>("candidate");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // 👇 auth gate comes here
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-3xl shadow">
          <h1 className="text-2xl font-bold mb-4">Crewlio</h1>
          <p className="mb-4 text-sm text-slate-500">
            Sign up or log in
          </p>

          <input
            className="w-full p-3 border rounded-xl mb-3"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 border rounded-xl mb-3"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleAuth}
            className="w-full bg-teal-700 text-white p-3 rounded-xl"
          >
            Sign Up / Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* your dashboard */}
    </main>
  );
}