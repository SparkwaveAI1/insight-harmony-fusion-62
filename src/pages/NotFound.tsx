
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Check if the user was trying to access a persona detail page
    if (location.pathname.includes('/persona-detail/') || 
        location.pathname.includes('/your-persona/')) {
      toast.error("The persona could not be found. Redirecting you to personas.");
      setTimeout(() => navigate("/persona-viewer"), 2000);
      return;
    }
    
    // Check if the user was trying to access a persona chat page
    if (location.pathname.includes('/persona-chat/') || 
        location.pathname.includes('/persona/') && location.pathname.includes('/chat')) {
      toast.error("This persona chat could not be found. Redirecting to persona library.");
      setTimeout(() => navigate("/persona-viewer"), 2000);
      return;
    }
    
    // Check if the user was coming from persona creation
    if (location.pathname.includes('/persona-creation')) {
      toast.info("Redirecting to personas...");
      setTimeout(() => navigate("/persona-viewer"), 1000);
      return;
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 max-w-lg">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <button 
          onClick={() => navigate("/")}
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
