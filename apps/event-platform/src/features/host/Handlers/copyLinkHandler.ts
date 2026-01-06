import { copyToClipboard } from "../../../shared/utils/clipboard";
import { getErrorMessage } from "../../../shared/utils/errors";
import type { Toast } from "@social/ui";

interface CopyLinkDeps {
  toast: Toast;
}

export const handleCopyLink = (deps: CopyLinkDeps) => async (link: string) => {
  const { toast } = deps;

  try {
    await copyToClipboard(link);
    toast("Invite link copied", "success");
  } catch (error: unknown) {
    toast(getErrorMessage(error, "Copy failed. Copy this link manually instead."), "error");
  }
};
