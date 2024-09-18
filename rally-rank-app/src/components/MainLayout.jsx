import NavBar from "./NavBar";

function MainLayout({ children }) {
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <NavBar />
                <div className="flex-grow flex flex-col justify-center items-center">
                    {children}
                </div>
            </div>
        </>
    );
}

export default MainLayout;
