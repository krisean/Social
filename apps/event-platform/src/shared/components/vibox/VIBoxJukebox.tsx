import React from "react";
import { VIBoxThemeProviderWithSystem } from "./ThemeProvider";
import { VIBoxJukeboxInner } from "./VIBoxJukeboxInner";

interface VIBoxJukeboxProps {
  isOpen: boolean;
  onClose: () => void;
  toast: (options: { title: string; variant: "success" | "error" | "info" }) => void;
  mode?: "host" | "team";
  allowUploads?: boolean;
}

/**
 * VIBoxJukebox - Main entry point with VIBox theme system
 * Wraps the original VIBoxJukeboxInner with the VIBox theme provider
 * This gives us the full-featured original implementation with proper theming
 */
export const VIBoxJukebox: React.FC<VIBoxJukeboxProps> = (props) => {
  return (
    <VIBoxThemeProviderWithSystem>
      <VIBoxJukeboxInner {...props} />
    </VIBoxThemeProviderWithSystem>
  );
};
