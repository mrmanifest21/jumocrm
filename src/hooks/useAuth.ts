import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const user = oauthUser
    ? {
        id: oauthUser.id,
        name: oauthUser.name || "User",
        email: oauthUser.email,
        avatar: oauthUser.avatar,
        role: oauthUser.role as "admin" | "manager" | "sales" | "support",
        phone: oauthUser.phone,
        department: oauthUser.department,
        isActive: oauthUser.isActive,
      }
    : localUser
    ? {
        id: localUser.id,
        name: localUser.name || localUser.username || "User",
        email: localUser.email,
        avatar: null,
        role: localUser.role as "admin" | "manager" | "sales" | "support",
        phone: localUser.phone,
        department: localUser.department,
        isActive: localUser.isActive,
      }
    : null;

  const isLoading = oauthLoading || localLoading;

  const logout = useCallback(() => {
    localStorage.removeItem("local_auth_token");
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isAdmin: user?.role === "admin",
      isManager: user?.role === "admin" || user?.role === "manager",
      logout,
    }),
    [user, isLoading, logout]
  );
}
