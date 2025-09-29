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

  const updatePost = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      postService.UpdatePost.bind(postService),
      [payload, token],
      { setLoading: setSaveLoading, setError }
    );
  });

  const userPost = async (sortOrder ) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      postService.getUserPost.bind(postService),
      [token, sortOrder ],
      { setLoading: setSaveLoading, setError }
    );
  };

  const deletePost = async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      postService.DeletePost.bind(postService),
      [id, token],
      { setLoading: setSaveLoading, setError }
    );
  };
  const likePost = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      postService.LikePost.bind(postService),
      [payload, token],
      { setLoading: setSaveLoading, setError }
    );
  });

  return {
    postLoading,
    saveLoading,
    error,
    createPost: createPost.current,
    updatePost: updatePost.current,
    likePost: likePost.current,
    userPost,
    deletePost,
  };
}
