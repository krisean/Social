import QRCode from "react-qr-code";

interface QRCodeBlockProps {
  value: string;
  caption?: string;
}

export function QRCodeBlock({ value, caption }: QRCodeBlockProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow">
      <div className="overflow-hidden rounded-1xl bg-white p-1 shadow-inner">
        <QRCode value={value} size={160} fgColor="#0f172a" bgColor="#ffffff" />
      </div>
      {caption ? (
        <p className="text-center text-sm font-medium text-slate-600">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

export default QRCodeBlock;
