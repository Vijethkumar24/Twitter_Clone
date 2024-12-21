import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const userUpdateProfilehook = () => {
    const { mutate: updateProfile, isPending } = useMutation({
        mutationFn: async ({ fullname, username, email, bio, link, newPassword, currentPassword, profileImg, coverImg }) => {
            const response = await axios.post(
                "http://twitter-clone-f64h.onrender.com/api/users/update",
                { fullname, username, email, bio, link, newPassword, currentPassword, profileImg, coverImg },
                { withCredentials: true }
            );
            return response.data; // Return the response data
        },
        onSuccess: () => {
            toast.success("Profile updated successfully");

        },
        onError: (error) => {
            if (error.response && error.response.data) {
                const { message } = error.response.data; // Extract the error message from the response
                toast.error(message); // Show the error message
            } else {
                toast.error("An unexpected error occurred."); // Fallback for other types of errors
            }
        },
    });
    return { updateProfile, isPending };
}

export default userUpdateProfilehook;