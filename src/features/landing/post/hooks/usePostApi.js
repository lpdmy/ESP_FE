import { useState, useRef, useCallback } from "react";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { PostService } from "../services/post.service";

export function usePostApi() {
  const [postLoading, setPostLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);

  const postService = new PostService();

  const createPost = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      postService.createPost.bind(postService),
      [payload, token],
      { setLoading: setSaveLoading, setError }
    );
  });
  const userPost = async (sortBy) => {
  const token = localStorage.getItem("token");
  return executeApiCall(
    postService.getUserPost.bind(postService),
    [token, sortBy],
    { setLoading: setSaveLoading, setError }
  );
  
};
const DeletePost = async () => {
  const token = localStorage.getItem("token");
  return executeApiCall(
    postService.deletePost.bind(postService),
    [token,postId ],
    { setLoading: setSaveLoading, setError }
  );
  
};
  return {
    postLoading,
    saveLoading,
    error,
    createPost: createPost.current,
    userPost,
    DeletePost,
  };
}
