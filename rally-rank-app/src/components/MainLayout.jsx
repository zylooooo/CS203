import UserNavBar from "./navigation-bars/UserNavBar";
import PublicNavBar from "./navigation-bars/PublicNavBar";
import AdministratorNavBar from "./navigation-bars/AdministratorNavBar";
import React, { useState, useEffect } from "react";
import { useAuth } from "../authentication/AuthContext";

function MainLayout({ children }) { 
const { isLoggedIn, isAdminLoggedIn } = useAuth();

  return (
    <>
        <div className = "flex flex-col min-h-screen">
                {isAdminLoggedIn ? (
                    <AdministratorNavBar />
                ) : isLoggedIn ? (
                    <UserNavBar />
                ) : (
                    <PublicNavBar />
                )}
            <div className = "flex-grow flex flex-col justify-start items-center">
                {children}
            </div>
        </div>
    </>
  );
}

export default MainLayout;
