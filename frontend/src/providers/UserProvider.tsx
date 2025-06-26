import { ReactNode } from "react";

const UserProvider = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

export default UserProvider;
