import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import userReducer from "./user/userSlice";
import pointReducer from "./star-point/pointSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "points"], 
};

const rootReducer = combineReducers({
  user: userReducer,
  points: pointReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
