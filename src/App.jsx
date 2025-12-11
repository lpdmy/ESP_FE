import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { loadNotificationsFromStorage } from "./store/notification/notificationSlice";
import { initGlobalNotification } from "./common/signalr/useGlobalNotification";
import { useSelector } from "react-redux";
import { getUserId } from "./common/utils/userUtils";
import SystemAnnouncementProvider from "./components/SystemAnnouncementProvider";

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const userId = getUserId(user);
  if (userId) {
    initGlobalNotification(userId, dispatch);
  }
  useEffect(() => {
    dispatch(loadNotificationsFromStorage());
  }, [dispatch]);

  return (
    <Router>
      <SystemAnnouncementProvider>
        <AppRoutes />
      </SystemAnnouncementProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}
