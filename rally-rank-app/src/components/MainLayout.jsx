import UserNavBar from "./navigation-bars/UserNavBar";
import PublicNavBar from "./navigation-bars/PublicNavBar";
import AdministratorNavBar from "./navigation-bars/AdministratorNavBar";

function MainLayout({ isLoggedIn, children }) {
  return (
    <>
        <div className = "flex flex-col min-h-screen">
            {isLoggedIn === -1 ? (
                <PublicNavBar />
            ) : isLoggedIn === 0 ? (
                <UserNavBar />
            ) : (
                <AdministratorNavBar />
            )}
            <div className = "flex-grow flex flex-col justify-start items-center">
                {children}
            </div>
        </div>
    </>
  );
}

export default MainLayout;

// -1 : PUBLIC -> Any person who goes to the website, but have yet to be logged in
//  0 : PLAYER -> Any person who has a verified account, and has logged into RallyRank
//  1 : ADMIN  -> Administrators of RallyRank