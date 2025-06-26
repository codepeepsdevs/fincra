"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useUserStore from "@/store/user.store";

interface UserProtectionProviderProps {
  children: React.ReactNode;
}

const UserProtectionProvider = ({ children }: UserProtectionProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isInitialized, checkToken } = useUserStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        await checkToken();
      } catch (error) {
        console.error("Token validation failed:", error);
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, [checkToken]);

  useEffect(() => {
    if (!isValidating && isInitialized) {
      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/signup");
      const isAuthenticated = isLoggedIn && user;

      if (!isAuthenticated && !isAuthPage) {
        router.replace("/login");
      }
    }
  }, [isValidating, isInitialized, isLoggedIn, user, pathname, router]);

  if (isValidating || !isInitialized) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserProtectionProvider;
