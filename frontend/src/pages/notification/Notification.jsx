import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const response = await axios.get("http://twitter-clone-f64h.onrender.com/api/notification/",
          { withCredentials: true },
        )
        return response.data;
      }
      catch (error) {
        if (error.response) {
          // Server responded with a status other than 2xx
          console.error("Error:", error.response.data);
        } else if (error.request) {
          // Request was made, but no response received
          console.error("No response from server:", error.request);
          throw new Error("No response from server");
        } else {
          // Something went wrong in setting up the request
          console.error("Axios error:", error.message);
          throw new Error(error.message);
        }
        return [];
      }

    }
  });
  const { mutate: deleteAllNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.delete("http://twitter-clone-f64h.onrender.com/api/auth/login/api/notification/", { withCredentials: true })
        return response.data;
      } catch (error) {
        if (error.response) {
          // Server responded with a status other than 2xx
          console.error("Error:", error.response.data);
        } else if (error.request) {
          // Request was made, but no response received
          console.error("No response from server:", error.request);
          throw new Error("No response from server");
        } else {
          // Something went wrong in setting up the request
          console.error("Axios error:", error.message);
          throw new Error(error.message);
        }
        return [];
      }

    }, onSuccess: () => {
      toast.success("Notifications Deleted Sucessfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }, onError: (error) => {
      toast.error(error.message);
    },
  })

  const deleteNotifications = () => {
    deleteAllNotifications();
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen Roboto Mono text-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {notifications?.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex gap-2 p-4">
              {notification.type === "follow" && (
                <FaUser className="w-7 h-7 text-primary" />
              )}
              {notification.type === "like" && (
                <FaHeart className="w-7 h-7 text-red-500" />
              )}
              <Link to={`/profile/${notification.from.username}`}>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>{" "}
                  {notification.type === "follow"
                    ? "followed you"
                    : "liked your post"}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
