import UserNavBar from "./navigation-bars/UserNavBar";
import PublicNavBar from "./navigation-bars/PublicNavBar";
import AdministratorNavBar from "./navigation-bars/AdministratorNavBar";
import React, { useState, useEffect } from "react";

// temp imports
import { AdministratorLogin, AdministratorTools, AdministratorTournaments } from "../administrator/AdministratorIndex";
import { MainHomepage, News, SignUp } from "../public/PublicIndex";
import { UserHome, UserLogin, UserProfile, UserTournaments } from "../user/UserIndex";


function MainLayout({ children }) { 
    
    const [authenticatedUser, setAuthenticatedUser] = useState(0);

    useEffect(() => {

        // temp implementation
        // replace with actual authentication logic
        if (children.type === UserHome || children.type === UserProfile
            || children.type === UserTournaments || children.type === News) {
          setAuthenticatedUser(0);
        } else if (children.type === AdministratorTools || children.type === AdministratorTournaments) {
          setAuthenticatedUser(1);
        } else if (children.type === MainHomepage || children.type === SignUp || children.type === UserLogin || children.type === AdministratorLogin) {
            setAuthenticatedUser(-1);
        }
      }, [children]);
    

  return (
    <>
        <div className = "flex flex-col min-h-screen">
            {authenticatedUser === -1 ? (
                <PublicNavBar />
            ) : authenticatedUser === 0 ? (
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