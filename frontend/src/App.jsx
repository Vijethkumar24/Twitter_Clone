import "./index.css";
import { Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/auth/signup/SignUpPage.jsx";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import HomePage from "./pages/home/HomePage.jsx";
import SideBar from "./components/common/Sidebar.jsx";
import RightPannel from "./components/common/RightPanel.jsx";
import NotificationPage from "./pages/notification/Notification.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "https://twitter-clone-f64h.onrender.com/api/auth/getme",
          { withCredentials: true }
        );
        return response.data;
      } catch (error) {
        if (error.response) {
          // Server responded with a status other than 2xx
          console.error("Error:", error.response.data);
          return null;
        } else if (error.request) {
          // Request was made, but no response received
          console.error("No response from server:", error.request);
          throw new Error("No response from server");
        } else {
          // Something went wrong in setting up the request
          console.error("Axios error:", error.message);
          throw new Error(error.message);
        }
      }
    }, // Fetch only if `jwt` exists in cookies
  });
  if (isLoading) {
    return (<>
  <div data-theme="forest" className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="relative">
          {/* Spinner */}
          <div
            className={`animate-spin border-t-4 border-blue-500 border-solid rounded-full w-24 h-24 lg:w-32 lg:h-32 `}
          ></div>

          {/* "X" Symbol */}
          <div
            className={`absolute inset-0 flex items-center justify-center text-blue-500 font-bold animate-pulse  text-6xl lg:text-8xl animate-pulse`}
          >
            X
          </div>
        </div>
      </div>
      </>
    );
  }
  return (
    <div className="sm:flex max-w-6xl mx-auto sm:flex-col lg:flex-row md:flex-row  w-full" >
      {authUser && <SideBar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {authUser && <RightPannel />}
      <Toaster />
    </div>
  );
}

export default App;
