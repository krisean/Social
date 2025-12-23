import { copyToClipboard } from "../../../shared/utils/clipboard";
import { getErrorMessage } from "../../../shared/utils/errors";
import type { Toast } from "../../../shared/hooks/useToast";

interface CopyLinkDeps {
  toast: Toast;
}

export const handleCopyLink = (deps: CopyLinkDeps) => async (link: string) => {
  const { toast } = deps;

  try {
    await copyToClipboard(link);
    toast({ title: "Invite link copied", variant: "success" });
  } catch (error: unknown) {
    toast({
      title: "Copy failed",
      description: getErrorMessage(error, "Copy this link manually instead."),
      variant: "error",
    });
  }
};
