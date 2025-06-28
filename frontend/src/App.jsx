import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
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
import { socket } from "./socket";

const App = () => {
  const location = useLocation();
  const fullPath = location.pathname;

  let firstPathSegment = "/"; // Default to root
  if (fullPath !== "/") {
    const segments = fullPath.split("/");
    if (segments.length > 1 && segments[1]) {
      firstPathSegment = `${segments[1]}`;
    }
  }

  const { authUser, isLoading } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const { isOnboarded } = authUser || {};
  const { theme } = useThemeStore();
  const [call, setCall] = useState();
  const [channelId, setChannelId] = useState();
  console.log({ authUserid: authUser?._id });
  console.log("Full Path:", fullPath);
  console.log("First Path Segment:", firstPathSegment); // Log the first path segment

  useEffect(() => {
    socket.on("receive_call", (data) => {
      console.log("receive call inside app");
      if (data.targetUserId === authUser?._id) {
        console.log({ firstPathSegment });
        //TODO: this should add another condition to check the channel id is matching or not
        if (firstPathSegment !== "call") {
          setCall(data);
        } else {
          //if the user is already inside the call page then it will auto accept
          console.log("accepting call hhhh");
          socket.emit("accept_call", { channelId: data.channelId });
        }
      }
      setChannelId(data.channelId);

      //this will be triggred the use calling cancels the call
      socket.on("cancel_call", (cancelCallData) => {
        if (cancelCallData.channelId === data.channelId) setCall(null);
      });
    });

    return () => {
      socket.off("receive_call");
    };
  }, [authUser, channelId, firstPathSegment]);

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
      {call && (
        <div className="card bg-base-200 hover:shadow-md transition-shadow fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl">
          <div className="card-body p-8 flex flex-col items-center justify-center ">
            <div className="avatar size-24">
              <img src={call.authUser.profilePic} />
            </div>
            <h1>{call.authUser.fullName} is Calling... </h1>
            <div className="flex gap-2 mt-6">
              <button
                className="btn bg-green-700 text-white"
                onClick={() => {
                  setCall(null);
                  socket.emit("accept_call", { channelId });
                  window.location.href = call.callUrl;
                }}
              >
                Accept
              </button>
              <button
                className="btn bg-red-700 text-white"
                onClick={() => {
                  setCall(null);
                  socket.emit("decline_call", { channelId });
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
