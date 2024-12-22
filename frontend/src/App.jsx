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
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";
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
    return (
 <LoadingSpinner size="lg"/>
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
