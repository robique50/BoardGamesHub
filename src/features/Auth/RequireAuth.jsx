import { useLocation, Navigate } from "react-router-dom";
import { useAuthContext } from "..";

export function RequireAuth({ children }) {
  const { user } = useAuthContext();
  const { pathname } = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: pathname }} />;
  }

  return children;
}
