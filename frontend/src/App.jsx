import React from "react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import NotificationPage from "./pages/NotificationPage";
import OnboardingPage from "./pages/OnboardingPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import { Toaster } from "react-hot-toast";
import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";
import { useThemeStore } from "./store/useThemeStore";
import PageLoader from "./components/PageLoader";

const App = () => {
  const { authUser, isLoading } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const { isOnboarded } = authUser || {};
  const { theme } = useThemeStore();
  if (isLoading) return <PageLoader />;
  return (
    <div data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar>
                <NotificationPage />
              </Layout>
            ) : (
              <Navigate to={isOnboarded ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout>
                <CallPage />
              </Layout>
            ) : (
              <Navigate to={isOnboarded ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={isOnboarded ? "/login" : "/onboarding"} />
            )
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
