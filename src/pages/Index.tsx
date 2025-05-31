import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is admin, redirect to dashboard
  // Otherwise redirect to tickets
  return <Navigate to={user.role === 'admin' ? "/dashboard" : "/tickets"} replace />;
};

export default Index;
