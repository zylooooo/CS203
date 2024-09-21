import NavBar from "./NavBar";
import PublicNavBar from "./PublicNavBar";
import AdminNavBar from "./AdminNavBar";

function MainLayout({ isLoggedIn, children }) {
  return (
    <>
      <div className = "flex flex-col min-h-screen">
        {isLoggedIn === -1 ? (
          <PublicNavBar />
        ) : isLoggedIn === 0 ? (
          <NavBar />
        ) : (
          <AdminNavBar />
        )}
        <div className = "flex-grow flex flex-col justify-start items-center">
          {children}
        </div>
      </div>
    </>
  );
}

export default MainLayout;

// -1 : PUBLIC
// 0  : PLAYER
// 1  : ADMIN
