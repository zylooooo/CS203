function PlayerLogin() {
    return (
        <div className="card">
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                >
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    className="input"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    className="input"
                    placeholder="••••••••"
                />
            </div>
            <button type="submit" className="button mt-3">
                Log In
            </button>
            <div className="flex items-center justify-center py-6">
                <div className="border-t border-gray-300 flex-grow mr-3"></div>
                <span className="text-gray-400">OR</span>
                <div className="border-t border-gray-300 flex-grow ml-3"></div>
            </div>
            <div className="text-xs">
                Don't have a RallyRank account?
                <a href="" className="text-xs text-blue-500">
                    Sign up as a new player
                </a>
            </div>
        </div>
    );
}

export default PlayerLogin;
