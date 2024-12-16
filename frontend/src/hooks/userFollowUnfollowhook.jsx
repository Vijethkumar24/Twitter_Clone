import toast from "react-hot-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

const userFollowUnfollowhook = () => {
  const queryClient = useQueryClient();
  const { mutate: followOrUnfollow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const response = await axios.post(
          `/api/users/follow/${userId}`,
          {},
          { withCredentials: true }
        );
        return response.data;
      } catch (error) {
        if (error.response) {
          // Server responded with a status other than 2xx
          console.error("Error:", error.response.data);
          throw new Error(error.response.data.error || "Failed to login");
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
      toast.success("user followed sucessfully");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return { followOrUnfollow, isPending };
};

export default userFollowUnfollowhook;
