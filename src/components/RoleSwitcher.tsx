import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";

const RoleSwitcher = () => {
  const { currentRole, setCurrentRole } = useApp();

  return (
    <div className="flex bg-muted rounded-lg p-1 gap-1">
      {(["requester", "runner"] as const).map((role) => (
        <button
          key={role}
          onClick={() => setCurrentRole(role)}
          className="relative flex-1 text-xs font-medium py-1.5 px-3 rounded-md capitalize transition-colors"
        >
          {currentRole === role && (
            <motion.div
              layoutId="role-pill"
              className="absolute inset-0 bg-card rounded-md shadow-sm"
              transition={{ type: "spring", duration: 0.4 }}
            />
          )}
          <span className={`relative z-10 ${currentRole === role ? "text-foreground" : "text-muted-foreground"}`}>
            {role === "requester" ? "Requester" : "Runner"}
          </span>
        </button>
      ))}
    </div>
  );
};

export default RoleSwitcher;
