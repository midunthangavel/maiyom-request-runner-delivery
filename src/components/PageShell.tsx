import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface Props {
  children: ReactNode;
  hideNav?: boolean;
  className?: string;
}

const PageShell = ({ children, hideNav, className = "" }: Props) => (
  <div className={`min-h-screen max-w-lg mx-auto bg-background ${className}`}>
    <div className="pb-20">{children}</div>
    {!hideNav && <BottomNav />}
  </div>
);

export default PageShell;
