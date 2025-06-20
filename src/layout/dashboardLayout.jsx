import { Outlet } from "react-router-dom";
import LeftSidebar from "../components/Dashboard/LeftSidebar";
import RightSidebar from "../components/Dashboard/RightSidebar";
import { useState } from "react";
import { RiCloseFill, RiMenuFill } from "react-icons/ri";

const DashboardLayout = ({ hideRightSidebar = false }) => {
  const [mobileLeftBar, setMobileLeftBar] = useState(false);

  return (
    <>
      <div className="mobile-head fixed top-0 z-[9999] bg-white block sm:hidden w-full">
        <div className="h-[100px] border-b border-[#F3F4F6] px-6 flex flex-col items-center justify-center gap-2">
          <img src="/honelogo.png" alt="HOEC Logo" className="h-[60px]" />
        </div>
        <div className="p-4 absolute top-0  bg-[#F3EAFF] z-[99] h-full flex justify-center items-center">
          {mobileLeftBar ? (
            <RiCloseFill
              onClick={() => setMobileLeftBar(false)}
              className="cursor-pointer text-xl text-gray-700"
            />
          ) : (
            <RiMenuFill
              onClick={() => setMobileLeftBar(true)}
              className="cursor-pointer text-xl text-gray-700"
            />
          )}
        </div>
      </div>
      <div className="flex md:h-screen w-full bg-[#F3EAFF] overflow-hidden md:mt-0 mt-[100px]">
        {/* Left Sidebar */}
        <LeftSidebar
          mobileLeftBar={mobileLeftBar}
          setMobileLeftBar={setMobileLeftBar}
        />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Right Sidebar (optional) */}
        {!hideRightSidebar && (
          <div className="hidden md:block">
            <RightSidebar />
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardLayout;
