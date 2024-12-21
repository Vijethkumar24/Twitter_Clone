import XSvg from "../svgs/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logOut,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.post(
          "http://twitter-clone-f64h.onrender.com/api/auth/logout",
          {},
          { withCredentials: true }
        );
      } catch (error) {
        if (error.response) {
          // Server responded with a status other than 2xx
          console.error("Error:", error.response.data);
          throw new Error(error.response.data.error || "Failed to logout");
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged Out SucessFully");
    },
  });
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="m-0 p-0 Roboto Mono flex flex-row h-auto w-auto text-4xl md:flex-[2_2_0] md:w-18 md:max-w-52 lg:flex-[2_2_0] sm:justify-around sm:border-b sm:border-gray-700 border-r border-gray-700">
      <div className="m-0 p-0 flex sticky top-0 left-0 h-auto md:h-screen lg:h-screen flex-row md:flex-col lg:flex-col w-screen border-gray-700" style={
        {
          width: "100%",
          borderBottom: "2px solid #4b5563",
          paddingBottom: "10px",
          justifyContent: "space-around",
          borderRight: "1px solid #4b5563" // Using the correct color value for gray-700
        }
      }>
        <Link to="/" className="flex sm:flex-col items-center md:justify-start mt-4">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex sm:flex-row md:flex-col lg:flex-col gap-4 mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <MdHomeFilled className="w-8 h-8" />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <IoNotifications className="w-6 h-6" />
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>

          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <FaUser className="w-6 h-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
        </ul>
        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className="mt-auto lg:mb-10 md:mb-10 flex gap-4 mb:items-start lg:items-start sm:items-end transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
          >
            <div className="avatar hidden md:inline-flex">
              <div className="w-8 rounded-full">
                <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
              </div>
            </div>
            <div className="flex justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {authUser?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{authUser?.username}</p>
              </div>
              <BiLogOut
                onClick={(e) => {
                  e.preventDefault();
                  logOut();
                }}
                className="w-7 h-7 cursor-pointer"
              />
            </div>
          </Link>
        )}
      </div>
    </div >
  );
};
export default Sidebar;
