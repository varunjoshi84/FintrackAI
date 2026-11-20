import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * AuthSuccess — handles Google OAuth PKCE code exchange.
 *
 * React 18 Strict Mode double-mounts every component in dev, which would
 * send the single-use auth code twice, causing a 400 on the second call.
 *
 * Fix: use sessionStorage keyed on the code itself. The first mount writes
 * the key and proceeds; the remount sees the key already set and skips.
 * sessionStorage survives the unmount/remount cycle (unlike useRef) but
 * is cleared when the tab closes, so it never leaks across sessions.
 */
const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search || location.search);
    const code = params.get("code");
    const legacyToken = params.get("token");
    const legacyUserStr = params.get("user");

    // Clear query params from the browser address bar immediately
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (code) {
      // Guard against React Strict-Mode double-invocation.
      // sessionStorage persists across the unmount/remount cycle, unlike useRef.
      const guardKey = `oauth_code_used_${code}`;
      if (sessionStorage.getItem(guardKey)) return;
      sessionStorage.setItem(guardKey, "1");

      // Clean up the guard after 2 minutes regardless of outcome
      setTimeout(() => sessionStorage.removeItem(guardKey), 120_000);

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

            // Normalise: strip any accidental absolute URL to just the path
            if (redirectUrl.startsWith("http")) {
              try { redirectUrl = new URL(redirectUrl).pathname; } catch { redirectUrl = "/dashboard"; }
            }
            // Never send back to auth or login pages
            if (!redirectUrl || redirectUrl === "/login" || redirectUrl === "/" || redirectUrl.includes("auth/success")) {
              redirectUrl = "/dashboard";
            }

            navigate(redirectUrl, { replace: true });
          } else {
            console.error("Auth exchange failed:", data.message);
            navigate("/login?error=auth_failed", { replace: true });
          }
        } catch (err) {
          console.error("Network error during auth exchange:", err);
          navigate("/login?error=network_error", { replace: true });
        }
      };

      exchangeCode();
      return;
    }

    // Legacy flow: token + user passed directly in URL params (old backend)
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
      } catch {
        navigate("/login", { replace: true });
      }
      return;
    }

    // No auth params at all — just go to dashboard
    navigate("/dashboard", { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-sm w-full mx-4">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800">Completing Sign-In</h3>
        <p className="text-sm text-gray-500 mt-1">Securing your session token…</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
