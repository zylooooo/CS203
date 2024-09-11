import NavBar from "../../components/NavBar";

function MainLayout({ children }) {
    return (
        <>
            <NavBar />
            <div className="flex flex-col justify-center items-center">
                {children}
            </div>
        </>
    );
}

export default MainLayout;
