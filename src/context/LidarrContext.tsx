import { ReactNode } from "react";

interface LidarrContextProviderProps {
  children: ReactNode;
}

export const LidarrContextProvider = ({ children }: LidarrContextProviderProps) => {
  return <>{children}</>;
};
