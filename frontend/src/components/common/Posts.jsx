import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

const Posts = ({ feedType, username, userId }) => {
  const [ismodelOpen, setModelOpen] = useState(false);
  const getPostEndPoint = (feedType) => {
    switch (feedType) {
      case "forYou":
        return "http://twitter-clone-f64h.onrender.com/api/posts/all";
      case "following":
        return "http://twitter-clone-f64h.onrender.com/api/posts/following";
      case "posts":
        return `http://twitter-clone-f64h.onrender.com/api/posts/user/${username}`;
      case "likes":
        return `http://twitter-clone-f64h.onrender.com/api/posts/like/${userId}`;
      default:
        return "http://twitter-clone-f64h.onrender.com/api/posts/all";
    }
  };
  const currentUrl = window.location.href;
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const POST_ENDPOINT = getPostEndPoint(feedType);
        const response = await axios.get(POST_ENDPOINT, {
          withCredentials: true,
        });
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
    },
    retry: 0,
  });
  useEffect(() => {
    refetch();
  }, [feedType, username, refetch]);
  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading && !isRefetching && (!posts || posts?.length === 0) && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}

      {!isLoading && !isRefetching && posts && posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} onUnlike={() => setIsUnliked(!isUnliked)} setModelOpen={setModelOpen} ismodelOpen={ismodelOpen} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
