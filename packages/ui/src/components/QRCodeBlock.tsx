import QRCode from "react-qr-code";

interface QRCodeBlockProps {
  value: string;
  caption?: string;
  isDark?: boolean;
}

export function QRCodeBlock({ value, caption, isDark = false }: QRCodeBlockProps) {
  return (
    <div className={`flex flex-col items-center gap-2 rounded-2xl p-4 shadow-lg border-[3px] ${!isDark ? 'bg-white shadow-slate-300/40 border-slate-200' : 'bg-slate-800 shadow-fuchsia-500/20 border-slate-600'}`}>
      <div className={`overflow-hidden rounded-1xl p-1 shadow-inner ${!isDark ? 'bg-white' : 'bg-slate-900'}`}>
        <QRCode
          value={value}
          size={160}
          fgColor={isDark ? "#ffffff" : "#000000"}
          bgColor={isDark ? "#000000" : "#ffffff"}
        />
      </div>
      {caption ? (
        <p className={`text-center text-lg font-semibold ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
          {caption}
        </p>
      ) : null}
    </div>
  );
}

export default QRCodeBlock;
