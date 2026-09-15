import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import supabase from "../config/supabase";
import AuthContext from "./AuthContext";
import { clearRegistrationIntent } from "./registrationIntent";

function isUsableSession(nextSession) {
  return Boolean(
    typeof nextSession?.user?.id === "string" &&
      nextSession.user.id.trim().length > 0 &&
      typeof nextSession.access_token === "string" &&
      nextSession.access_token.trim().length > 0 &&
      typeof nextSession.expires_at === "number" &&
      Number.isFinite(nextSession.expires_at * 1000) &&
      nextSession.expires_at * 1000 > Date.now()
  );
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const accessToken = session?.access_token;
  const expiresAt = session?.expires_at;

  useEffect(() => {
    let subscribed = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!subscribed) {
        return;
      }

      setSession(
        event !== "SIGNED_OUT" && isUsableSession(nextSession)
          ? nextSession
          : null
      );
      setIsLoading(false);

      if (event === "SIGNED_OUT") {
        clearRegistrationIntent();
      }
    });

    return () => {
      subscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!accessToken || !Number.isFinite(expiresAt)) {
      return undefined;
    }

    let timeoutId;

    function handleExpiry() {
      const remainingMilliseconds = expiresAt * 1000 - Date.now();

      if (remainingMilliseconds > 0) {
        timeoutId = window.setTimeout(
          handleExpiry,
          Math.min(remainingMilliseconds, 2147483647)
        );
        return;
      }

      // An old timer must not remove a refreshed session.
      setSession((currentSession) =>
        currentSession?.access_token === accessToken &&
        currentSession?.expires_at === expiresAt
          ? null
          : currentSession
      );
    }

    timeoutId = window.setTimeout(
      handleExpiry,
      Math.max(
        0,
        Math.min(expiresAt * 1000 - Date.now(), 2147483647)
      )
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, expiresAt]);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        throw error;
      }

      setSession(null);
      clearRegistrationIntent();
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  const visibleSession = isSigningOut ? null : session;

  const value = useMemo(
    () => ({
      session: visibleSession,
      user: visibleSession?.user ?? null,
      accessToken: visibleSession?.access_token ?? null,
      isAuthenticated: Boolean(visibleSession?.user),
      isLoading: isLoading || isSigningOut,
      isSigningOut,
      signOut,
    }),
    [visibleSession, isLoading, isSigningOut, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;