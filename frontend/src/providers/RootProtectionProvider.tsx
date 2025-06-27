"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/user.store";

interface RootProtectionProviderProps {
  children: React.ReactNode;
}

const RootProtectionProvider = ({ children }: RootProtectionProviderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isInitialized, user } = useUserStore();

  useEffect(() => {
    if (isLoggedIn && user && isInitialized && pathname.startsWith("/login")) {
      const redirectPath = "/overview";
      router.replace(redirectPath);
    }
  }, [isLoggedIn, isInitialized, pathname, user]);

  if (!isInitialized) {
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

export default RootProtectionProvider;
