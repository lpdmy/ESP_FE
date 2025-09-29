import { useState, useRef, useCallback } from "react";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { CollectionService } from "../services/collection.service";

export function useCollectionApi() {
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const collectionService = new CollectionService();

  const getCollectionsByUser = async (pageNumber, pageSize) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      collectionService.getCollectionByUser.bind(collectionService),
      [token, pageNumber, pageSize],
      { setLoading: setCollectionLoading, setError }
    );
  };
  const createCollection = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      collectionService.createCollection.bind(collectionService),
      [ token,payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  const deleteCollection = useRef(async (id) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      collectionService.deleteCollection.bind(collectionService),
      [ token,id],
      { setLoading: setSaveLoading, setError }
    );
  });
  const updateCollection = useRef(async (payload) => {
    const token = localStorage.getItem("token");
    return executeApiCall(
      collectionService.updateCollection.bind(collectionService),
      [ token,payload],
      { setLoading: setSaveLoading, setError }
    );
  });
  

  return {
    collectionLoading,
    saveLoading,
    error,
    getCollectionsByUser,
    updateCollection : updateCollection.current,
    deleteCollection: deleteCollection.current,
    createCollection: createCollection.current
  };
}
