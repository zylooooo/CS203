import { Link } from "react-router-dom";

function PlayerLogin() {
    return (
        <>
            <h1 className="m-8 font-bold text-2xl">Player Login</h1>
            <div>
                <form action="POST" className="card">
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
                    <button
                        type="submit"
                        className="button mt-6 font-bold hover:shadow-inner"
                    >
                        Log In
                    </button>
                    <div className="flex items-center justify-center py-6">
                        <div className="border-t border-gray-100 flex-grow mr-3 opacity-50"></div>
                        <span className="text-gray-199 text-xs opacity-50">
                            OR
                        </span>
                        <div className="border-t border-gray-100 flex-grow ml-3 opacity-50"></div>
                    </div>
                    <div className="text-xs text-blue-500">
                        Don't have a RallyRank account?
                        <Link
                            to=""
                            className="hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
                        >
                            Sign up as a new player
                        </Link>
                    </div>
                </form>
                <div className="text-blue-500 text-ms flex flex-row justify-center align-item mt-10">
                    RallyRank Adminstrator?
                    <Link
                        to="/login-admin"
                        className="hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
                    >
                        Sign up as an admin
                    </Link>
                </div>
            </div>
        </>
    );
}

function AdminLogin() {
    return (
        <>
            <h1 className="m-8 font-bold text-2xl">Admin Login</h1>
            <div>
                <form action="POST" className="card">
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
                    <button
                        type="submit"
                        className="button mt-6 font-bold hover:shadow-inner"
                    >
                        Log In
                    </button>
                    <div className="flex items-center justify-center py-6">
                        <div className="border-t border-gray-100 flex-grow mr-3 opacity-50"></div>
                        <span className="text-gray-199 text-xs opacity-50">
                            OR
                        </span>
                        <div className="border-t border-gray-100 flex-grow ml-3 opacity-50"></div>
                    </div>
                    <div className="text-xs text-blue-500">
                        Don't have a RallyRank Admin account?
                        <Link
                            to=""
                            className="hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
                        >
                            Sign up as an admin
                        </Link>
                    </div>
                </form>
                <div className="text-blue-500 text-ms flex flex-row justify-center align-item mt-10">
                    Looking for player login?
                    <Link
                        to="/login"
                        className="hover:text-primary-color-green font-bold underline pl-2 text-secondary-color-dark-green"
                    >
                        Back to player login
                    </Link>
                </div>
            </div>
        </>
    );
}

export { PlayerLogin, AdminLogin };
