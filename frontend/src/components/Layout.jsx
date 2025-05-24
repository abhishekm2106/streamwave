import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useRef } from "react";

const Layout = ({ children, showSidebar = false }) => {
  const navbar = useRef(null);
  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar ref={navbar} />

          <main
            style={{
              minHeight: `calc(100vh - ${
                navbar.current ? navbar?.current?.offsetHeight : 0
              }px)`,
            }}
            className="flex-1 overflow-y-auto flex flex-col justify-between"
          >
            {children}

            <div className="w-full flex justify-center mb-2">
              Made with 🧡 by&nbsp;
              <a
                href="https://www.linkedin.com/in/abhishekm2106/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abhishek Mohanty
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
