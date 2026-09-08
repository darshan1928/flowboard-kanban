import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useAppDispatch } from "./app/hooks";
import { restoreSession } from "./features/auth/authSlice";
import AppRoutes from "./routes/AppRoutes";
import Toast from "./components/Toast";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toast />
    </BrowserRouter>
  );
}
