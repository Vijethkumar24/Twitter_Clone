import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash, } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { CiImageOn } from "react-icons/ci";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date/date.js"



const Post = ({ post, setModelOpen, ismodelOpen }) => {
  if (!post) {
    // Render nothing or return a fallback UI if post is undefined
    return <div>Error: Post data is unavailable</div>;
  }


  const [img, setImg] = useState(null);
  const imgRef = useRef(null);

  const [comment, setComment] = useState("");

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const postOwner = post?.user;
  const isLiked = post.likes.includes(authUser._id);

  const isMyPost = authUser._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt);

  const queryClient = useQueryClient();

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.delete(
          `/api/posts/${post._id}`,
          { withCredentials: true }
        );
        return response.data;
      } catch (error) {
        throw new Error("Something Went Wrong");
      }
    },
    onSuccess: () => {
      toast.success("Post deleted Sucessfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setModelOpen(false);
    },
  });
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.post(
          `/api/posts/like/${post._id}`,
          {},
          { withCredentials: true }
        );
        return response.data;
      } catch (error) {
        throw new Error("Something Went Wrong");
      }
    },
    onSuccess: (updatedLikes) => {
      // this is not the best UX, bc it will refetch all posts
      // queryClient.invalidateQueries({ queryKey: ["posts"] });
      // instead, update the cache directly for that post
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { mutate: commentOnPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const username = authUser.username;
        let url = "";
        // Check if the route should be for a profile-based comment or regular post comment
        if (post._id) {
          // If post._id exists, comment on a specific post
          url = `/api/posts/comment/${post._id}`;
        } else if (username) {
          // If username exists, we assume it's a profile page and add logic for handling profile comment
          url = `/api/posts/profile/${username}/comment/${post._id}`;
        }
        const response = await axios.post(
          url,
          { text: comment, img: img },
          { withCredentials: true }
        );
        return response.data;
      } catch (error) {
        throw new Error("Something Went Wrong");
      }
    },
    onSuccess: () => {
      toast.success("Commented Sucessfully");
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { mutate: deleteAPost, isPending: isDeletingApost } = useMutation({
    mutationFn: async ({ userId, commentId, postId }) => {
      try {
        const response = await axios.delete(
          `api/posts/${postId}/comments/${commentId}`,
          {
            data: { userId }, // Include these in the request body
            withCredentials: true,
          }
        );
        return response.data;
      } catch (error) {
        throw new Error("Something Went Wrong");
      }
    },
    onSuccess: () => {
      toast.success("comment deleted Sucessfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setModelOpen(false);
    },
  });

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = () => {
    const currentUrl = window.location.href;
    console.log(currentUrl);
    commentOnPost();
  };
  const handleLikePost = () => {
    likePost();
  };
  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className={`Roboto Mono  flex gap-2 items-start p-4 border-b  border-gray-700 ${ismodelOpen ? "blur-sm" : ""}`}>
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                {!isDeleting && (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleDeletePost}
                  />
                )}

                {isDeleting && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">

            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() => {
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                  setModelOpen(true);
                }
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              {/* We're using Modal Component from DaisyUI */}
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none "
              >
                <div className=" modal-box rounded border border-gray-600 ">
                  <h3 className="font-bold  mb-4">COMMENTS</h3>
                  <div className="flex  flex-col gap-3 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-md text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment.user.profileImg ||
                                "/avatar-placeholder.png"
                              }
                            />
                          </div>

                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.fullName}
                            </span>
                            <span className="text-gray-700 text-md">
                              @{comment.user.username}
                            </span>
                            {authUser._id === comment.user._id && (
                              <FaTrash
                                onClick={() => {

                                  deleteAPost({ userId: authUser._id, commentId: comment._id, postId: post._id });
                                }} // Call delete function on click
                                className="text-gray-500 hover:text-red-600 flex self-end"
                              />
                            )}
                          </div>
                          <div className="flex text-md">{comment.text}</div>
                          {comment.img && (
                            <img
                              src={comment.img}
                              alt="Comment Attachment"
                              className="mt-2 max-w-full rounded-lg border border-gray-600"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    className="flex-wrap gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea min-w-full p-1 h-15 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}

                    />
                    <div className="flex-wrap w-full comment-button">
                      <div className="flex-col comment-section">
                        {/* Image preview */}
                        {img && (
                          <div className="image-preview mb-2 relative ">
                            <img
                              src={img}
                              alt="Preview"
                              className="min-w-auto h-auto rounded-lg border border-gray-600"
                            />
                            <IoMdClose className="absolute top-2 left-2 z-10" onClick={() => setImg(null)} />

                          </div>
                        )}
                      </div>
                      <div className="flex flex-row postbtn w-full items-center gap-2">
                        <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                          {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                        </button>
                        <CiImageOn
                          className="fill-primary w-10 h-10 cursor-pointer"
                          onClick={() => imgRef.current.click()}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          ref={imgRef}
                          onChange={handleImgChange}
                        />
                      </div>
                    </div>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none" onClick={() => setModelOpen(false)}>close</button>
                </form>
              </dialog>
              <div className="flex  gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm  group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
                    }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div >
    </>
  );
};
export default Post;
