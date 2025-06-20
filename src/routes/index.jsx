import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import EditProfile from "../pages/Profile/EditProfile";
import ProtectedRoute from "../components/ProtectedRoute";
import { OTPVerification } from "../components/auth/OTPVerification";
import { ForgotPassword } from "../components/auth/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import PersonalityTest from "../pages/Personality/PersonalityTest";
import PersonalityMatches from "../pages/Personality/PersonalityMatches";
import UserProfile from "../pages/Profile/UserProfile";
import Chatpage from "../pages/Chat/Chat";
import Messages from "../pages/Messages/Messages";
import Notifications from "../components/Dashboard/Notifications";
import TermsAndConditions from "../pages/TermsAndConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import SubscriptionSuccess from "../components/Subscription/SubscriptionSuccess";

import SubscriptionCancel from "../components/Subscription/Cancel";
import SubscriptionFailure from "../components/Subscription/Failure";
import DashboardLayout from "../layout/dashboardLayout";
import RightSidebar from "../components/Dashboard/RightSidebar";

// const SubscriptionSuccess = () => {
//   return <Navigate to="/dashboard" replace state={{ from: "subscription" }} />;
// };

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<OTPVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route
        path="/personality-test"
        element={
          <ProtectedRoute>
            <PersonalityTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscription/success"
        element={
          <ProtectedRoute>
            <SubscriptionSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscription/cancel"
        element={
          <ProtectedRoute>
            <SubscriptionCancel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subscription/failure"
        element={
          <ProtectedRoute>
            <SubscriptionFailure />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout hideRightSidebar />
          </ProtectedRoute>
        }
      >
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/user-profile/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route path="activity" element={<RightSidebar />} />
        <Route
          path="/personality-matches"
          element={
            <ProtectedRoute>
              <PersonalityMatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:roomId"
          element={
            <ProtectedRoute>
              <Chatpage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
