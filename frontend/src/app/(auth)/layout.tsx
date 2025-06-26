import RootProtectionProvider from "@/providers/RootProtectionProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootProtectionProvider>{children}</RootProtectionProvider>;
}
