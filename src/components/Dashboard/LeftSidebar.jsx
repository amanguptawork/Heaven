import { Fragment, memo, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RiCloseFill, RiMenuFill, RiMessage2Line } from "react-icons/ri";
import SubscriptionModal from "../Subscription/SubscriptionModal";
import { useQuery } from "@tanstack/react-query";
import { getPersonalityMatches, getWhoLikedMe } from "../../api/matches";
import SupportModal from "./Support/SupportModal";
import { Dialog, Transition } from "@headlessui/react";
import {
  RiDashboardLine,
  RiUser3Line,
  RiNotification3Line,
  RiPsychotherapyLine,
  RiCoinLine,
  RiLogoutBoxRLine,
  RiHome2Line,
  RiCustomerServiceLine,
  RiHeartsFill,
} from "react-icons/ri";
import useUserProfileStore from "../../store/user";
import { fetchUserProfile, logoutUser } from "../../api/profile";
import { useSocket } from "../../context/SocketContext";

import { MdOutlinePendingActions } from "react-icons/md";

const LeftSidebar = ({ mobileLeftBar, setMobileLeftBar }) => {
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const { userProfile, hasTakenTest, setUserProfile } = useUserProfileStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: profileData, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (profileData) {
      setUserProfile(profileData);
    }
  }, [profileData, setUserProfile]);

  // Fetch personality matches and likes for the notification counter
  const { data: personalityMatches } = useQuery({
    queryKey: ["personalityMatches"],
    queryFn: getPersonalityMatches,
  });

  const { data: whoLikedMe } = useQuery({
    queryKey: ["whoLikedMe"],
    queryFn: getWhoLikedMe,
  });

  // Combined notification count
  const activityNotificationCount =
    (personalityMatches?.count || 0) + (whoLikedMe?.unseenCount || 0);

  // Logout
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    logoutUser()
      .then(() => {
        if (socket) {
          socket.emit("logout", { userId: userProfile._id });
          socket.disconnect();
        }
        localStorage.clear();
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  useEffect(() => {
    // whenever the test‐completed flag changes, re‐pull the profile
    refetch();
  }, [hasTakenTest, refetch]);

  const userSubscriptionStatus = userProfile?.subscriptionStatus || "free";

  // Build navbar items dynamically after user data is loaded
  const getNavItems = () => {
    // Create a consistent array of nav items
    const items = [
      {
        title: "Explore",
        icon: RiDashboardLine,
        path: "/dashboard",
        notifications: 0,
      },
      {
        title: "Messages",
        icon: RiMessage2Line,
        path: "/messages",
        notifications: 0,
      },
      {
        title: "Profile",
        icon: RiUser3Line,
        path: "/profile",
        notifications: 0,
      },
    ];

    if (mobileLeftBar) {
      items.push({
        title: "Activity",
        icon: MdOutlinePendingActions,
        path: "/activity",
      });
    }

    items.push(
      hasTakenTest
        ? {
            title: "View Matches",
            icon: RiHeartsFill,
            path: "/personality-matches",
          }
        : {
            title: "Personality Test",
            icon: RiPsychotherapyLine,
            path: "/personality-test",
            notifications: 0,
          }
    );

    // Add remaining items
    items.push(
      {
        title: "Upgrade",
        icon: RiCoinLine,
        path: "#", // triggers subscription modal
        onClick: () => setShowSubscriptionModal(true),
        notifications: 0,
      },
      {
        title: "Landing Page",
        icon: RiHome2Line,
        path: "/",
        notifications: 0,
      },
      {
        title: "Support",
        icon: RiCustomerServiceLine,
        path: "#",
        onClick: () => setShowSupportModal(true),
        notifications: 0,
      },
      {
        title: "Notifications",
        icon: RiNotification3Line,
        path: "/notifications",
        notifications: activityNotificationCount,
      }
    );

    // Filter out "Upgrade" if user is premium
    return items.filter((item) => {
      if (item.title === "Upgrade") {
        return userSubscriptionStatus !== "premium";
      }
      return true;
    });
  };

  // Make sub menu open on hover
  const handleMouseEnter = (itemTitle) => {
    setExpandedItem(itemTitle);
  };
  const handleMouseLeave = () => {
    setExpandedItem(null);
  };

  const navItems = getNavItems();

  const mobileWidth = mobileLeftBar
    ? "w-64 opacity-100 visible sm:pt-[60px]"
    : "w-0 opacity-0 pt-0 invisible";
  const desktopWidth = sidebarOpen ? "md:w-64" : "md:w-16";
  const showText = sidebarOpen;

  return (
    <>
      <div
        className={`h-full fixed top-0 left-0 md:static bg-white backdrop-blur-lg flex flex-col transition-all duration-300 z-50 md:opacity-100 md:visible ${mobileWidth} ${desktopWidth}`}
      >
        {/* Hamburger / Close icon */}
        <div className="p-4 flex justify-center items-center border-b border-gray-200">
          <div className="hidden sm:flex">
            {sidebarOpen ? (
              <RiCloseFill
                onClick={() => setSidebarOpen(false)}
                className="cursor-pointer text-xl text-gray-700"
              />
            ) : (
              <RiMenuFill
                onClick={() => setSidebarOpen(true)}
                className="cursor-pointer text-xl text-gray-700"
              />
            )}
          </div>
          {/* Optionally show your membership text if open */}
          {sidebarOpen && (
            <h5 className="text-xs text-right sm:ml-auto">
              {userSubscriptionStatus === "free"
                ? "Free Membership"
                : "Premium Membership"}
            </h5>
          )}
        </div>

        {sidebarOpen && (
          <div className="h-[122px] hidden md:flex border-b border-[#F3F4F6] px-6 flex-col items-center justify-center gap-2">
            <img src="/honelogo.png" alt="HOEC Logo" className="h-[73px]" />
          </div>
        )}

        {/* Navigation Items */}
        <nav
          className={`flex-1 ${
            showText ? "px-4" : "px-2"
          } py-6 space-y-2 md:pt-5 pt-[90px] overflow-y-auto`}
        >
          {navItems.map((item) => {
            const { title, path, subItems, icon: Icon } = item;

            // Explicitly define which items can have subItems
            // Make sure "View Matches" and "Personality Test" never have subItems
            const hasSubItems =
              Array.isArray(subItems) &&
              subItems.length > 0 &&
              title !== "View Matches" &&
              title !== "Personality Test";

            // We do not highlight "Upgrade", "Landing Page", or "Support" unless you're on that path
            const skipHighlight =
              title === "Upgrade" ||
              title === "Landing Page" ||
              title === "Support";

            // If this item has subItems, check if location is on any of those sub paths
            const isActive = (() => {
              if (skipHighlight) return false;
              if (hasSubItems) {
                // highlight only if user is currently on one of the subItem paths
                return subItems.some((sub) =>
                  location.pathname.startsWith(sub.path)
                );
              }
              // otherwise check the normal path
              return location.pathname.startsWith(path.replace("#", ""));
            })();

            const isExpanded = expandedItem === title;

            return (
              <div
                key={title}
                onMouseEnter={() => hasSubItems && handleMouseEnter(title)}
                onMouseLeave={() => hasSubItems && handleMouseLeave()}
              >
                <Link
                  to={path === "#" ? location.pathname : path}
                  onClick={(e) => {
                    if (path === "#") {
                      e.preventDefault();
                    }
                    if (item.onClick) {
                      item.onClick();
                    }
                    if (mobileLeftBar) setMobileLeftBar(false);
                  }}
                  className={`flex items-center relative ${
                    !showText ? "px-1 py-3 justify-center" : "px-3 py-3"
                  } rounded-xl transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-[#3F3F94] to-[#B492DE] text-white"
                      : "hover:bg-purple-50 text-gray-900"
                  } ${item.title === "Activity" ? "block sm:hidden" : ""}`}
                >
                  <Icon className="w-6 h-6" />
                  {showText && (
                    <span className="ml-4 font-medium">{title}</span>
                  )}
                  {title === "Profile" &&
                    sidebarOpen &&
                    userSubscriptionStatus === "premium" && (
                      <img
                        src="/premiumhone.png"
                        alt="Premium"
                        className={`${
                          showText ? "w-5 h-5  ml-2" : "w-3 h-3  ml-1"
                        } `}
                      />
                    )}

                  {hasSubItems && showText && (
                    <span className="ml-auto text-sm">
                      {isExpanded ? "-" : "+"}
                    </span>
                  )}
                  {item.notifications > 0 && (
                    <span
                      className={`ml-2 text-white py-1 rounded-full ${
                        item.badge?.color || "bg-red-500"
                      } ${
                        !showText
                          ? "px-1 text-[0] ml-0 absolute bottom-5 right-1"
                          : "px-2 text-xs"
                      }`}
                    >
                      {item.notifications}
                    </span>
                  )}
                </Link>

                {/* Sub-items appear on hover if applicable */}
                {hasSubItems && isExpanded && sidebarOpen && (
                  <div className="ml-8 mt-1">
                    {subItems.map((sub) => {
                      const subActive = location.pathname.startsWith(sub.path);
                      return (
                        <Link
                          key={sub.title}
                          to={sub.path}
                          className={`block px-4 py-2 rounded-xl transition-colors ${
                            subActive
                              ? "bg-gradient-to-r from-gray-300 to-gray-400 text-white"
                              : "hover:bg-purple-50 text-gray-900"
                          }`}
                        >
                          {sub.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Section with Dropdown */}
        <div className="border-t border-[#F3F4F6] p-4 relative">
          <div
            className={`flex items-center ${
              showText ? "p-4" : "p-0"
            }  hover:bg-purple-50 rounded-xl cursor-pointer`}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={userProfile?.photos[0]}
                alt={userProfile?.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
            </div>
            {showText && (
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.fullName || "Loading..."}
                  </p>
                  {userSubscriptionStatus === "premium" && (
                    <img
                      src="/premiumhone.png"
                      alt="Premium"
                      className="w-5 h-5 ml-2"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500">Log out</p>
              </div>
            )}
          </div>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div
              className={`mb-2 bg-white rounded-xl shadow-lg border border-gray-200 ${
                showText
                  ? "absolute bottom-full left-4 right-4 "
                  : "fixed bottom-[60px] left-[20px] z-[99]"
              }`}
            >
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <RiLogoutBoxRLine className="mr-2" />
                Logout
              </button>
            </div>
          )}

          {/* Logout Confirmation Modal */}
        </div>
        {/* </div> */}
        {/* Subscription Modal (outside logout tooltip, with a high z-index) */}
      </div>
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[9999]">
          <SubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
          />
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[9999]">
          <SupportModal
            isOpen={showSupportModal}
            onClose={() => setShowSupportModal(false)}
            userProfile={userProfile}
          />
        </div>
      )}

      <Transition appear show={isLogoutModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[9999]"
          onClose={() => setIsLogoutModalOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Confirm Logout
              </Dialog.Title>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
export default memo(LeftSidebar);
