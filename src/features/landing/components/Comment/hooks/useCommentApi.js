import { useState, useRef, useCallback } from "react";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { CommentService } from "../services/comment.service";
export function useCommentApi() {
  const [commentLoading, setcommentLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const commentService = new CommentService()
  const createComment = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      commentService.createComment.bind(commentService),
      [ payload,token],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getCommentByPost = useRef(async (id, pageNumber, pageSize) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      commentService.getCommentByPost.bind(commentService),
      [token, id, pageNumber, pageSize],
      { setLoading: setSaveLoading, setError }
    );
  });
  const getCommentByComment = useRef(async (id, pageNumber, pageSize) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      commentService.getCommentByComment.bind(commentService),
      [token, id, pageNumber, pageSize],
      { setLoading: setSaveLoading, setError }
    );
  });
  const updateComment = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      commentService.updateComment.bind(commentService),
      [payload,token],
      { setLoading: setSaveLoading, setError }
    );
  });
  const deleteComment = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      commentService.deleteComment.bind(commentService),
      [id,token],
      { setLoading: setSaveLoading, setError }
    );
  });
  return {
    commentLoading,
    saveLoading,
    error,
    createComment: createComment.current,
    getCommentByPost: getCommentByPost.current,
    getCommentByComment: getCommentByComment.current,
    updateComment : updateComment.current,
    deleteComment : deleteComment.current
  };
}
