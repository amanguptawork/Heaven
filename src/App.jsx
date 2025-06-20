import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { UserLimitsProvider } from "./context/UserLimitsContext";
import useWakeLock from "./components/useWakeLock";
// import NotificationSound from "./notificationSound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        // if axios‐style 401 or our custom flag
        if (error.response?.status === 401 || error.isAuthError) {
          // clear token
          localStorage.removeItem("authToken");
          // redirect to login
          window.location.href = "/login";
        }
      },
    },
    mutations: {
      onError: (error) => {
        if (error.response?.status === 401 || error.isAuthError) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
      },
    },
  },
});

function App() {
  useWakeLock();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <UserLimitsProvider>
            <BrowserRouter>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#333",
                    color: "#fff",
                  },
                }}
              />
              <AppRoutes />
            </BrowserRouter>
          </UserLimitsProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
