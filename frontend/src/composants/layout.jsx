import Sidebar from "./sidebar";
import Header from "./header";
import Footer from "./footer";
import "../styles/composants/_layout.scss";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-layout">

        {/* OVERLAY MOBILE */}
        {sidebarOpen && (
            <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            ></div>
        )}

        {/* SIDEBAR */}
        <Sidebar open={sidebarOpen} />

        {/* MAIN */}
        <div className="app-main">
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="app-content">
            <Outlet />
            </div>

            {/* FOOTER GLOBAL */}
            <Footer />
        </div>
        </div>
    );
}

