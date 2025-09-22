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

  return {
    postLoading,
    saveLoading,
    error,
    createPost: createPost.current,
  };
}
