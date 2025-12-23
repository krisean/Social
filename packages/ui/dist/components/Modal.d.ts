import type { PropsWithChildren, ReactNode } from "react";
interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    footer?: ReactNode;
}
export declare function Modal({ open, onClose, title, footer, children, }: PropsWithChildren<ModalProps>): import("react").ReactPortal | null;
export default Modal;
//# sourceMappingURL=Modal.d.ts.map