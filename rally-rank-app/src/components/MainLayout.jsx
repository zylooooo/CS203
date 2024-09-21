//import NavBar from "./NavBar";
import PublicNavBar from "./PublicNavBar"

function MainLayout({ children }) {
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <PublicNavBar />
                <div className="flex-grow flex flex-col justify-start items-center">
                    {children}
                </div>
            </div>
        </>
    );
}

export default MainLayout;
