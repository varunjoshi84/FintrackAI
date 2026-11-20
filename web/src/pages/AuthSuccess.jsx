import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isExecutingRef = useRef(false);

  useEffect(() => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    const params = new URLSearchParams(window.location.search || location.search);
    const code = params.get("code");
    const legacyToken = params.get("token");
    const legacyUserStr = params.get("user");

    // Clear parameters from the browser address bar cleanly
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (code) {
      const exchangeCode = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
          const res = await fetch(`${apiUrl}/auth/exchange-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const data = await res.json();
          if (data.success && data.token) {
            localStorage.setItem("authToken", data.token);
            if (data.user?.email) localStorage.setItem("userEmail", data.user.email);
            if (data.user) localStorage.setItem("userInfo", JSON.stringify(data.user));

            window.dispatchEvent(new CustomEvent("userLogin", { detail: data.user }));

            let redirectUrl = localStorage.getItem("loginRedirectUrl") || "/dashboard";
            localStorage.removeItem("loginRedirectUrl");

            if (redirectUrl.startsWith("http")) {
              try { redirectUrl = new URL(redirectUrl).pathname; } catch { redirectUrl = "/dashboard"; }
            }
            if (redirectUrl === "/login" || redirectUrl === "/" || redirectUrl.includes("auth/success")) {
              redirectUrl = "/dashboard";
            }

            navigate(redirectUrl, { replace: true });
          } else {
            console.error("Auth exchange error:", data.message);
            window.location.href = "/login?error=auth_failed";
          }
        } catch (err) {
          console.error("Network exchange error:", err);
          window.location.href = "/login?error=network_error";
        }
      };

      exchangeCode();
      return;
    }

    if (legacyToken && legacyUserStr) {
      try {
        const user = JSON.parse(decodeURIComponent(legacyUserStr));
        localStorage.setItem("authToken", legacyToken);
        if (user.email) localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userInfo", JSON.stringify({
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role || "user",
          plan: user.plan || "Basic",
          isVerified: user.isVerified !== false,
        }));

        window.dispatchEvent(new CustomEvent("userLogin", { detail: user }));
        navigate("/dashboard", { replace: true });
      } catch (err) {
        window.location.href = "/login";
      }
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-sm w-full mx-4">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800">Completing Sign-In</h3>
        <p className="text-sm text-gray-500 mt-1">Securing your session token...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
