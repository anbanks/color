interface PaletteContentProps {
  title: string;
  description: string;
  applications: string;
  psychology: string;
}

export function PaletteContent({
  applications,
  psychology,
}: PaletteContentProps) {
  if (!applications && !psychology) return null;

  return (
    <div className="mt-10 space-y-6">
      {applications && (
        <section>
          <h2 className="text-[15px] font-semibold text-gray-800 dark:text-white mb-2">Practical Applications</h2>
          <p className="text-[14px] text-gray-500 dark:text-white/50 leading-relaxed">{applications}</p>
        </section>
      )}
      {psychology && (
        <section>
          <h2 className="text-[15px] font-semibold text-gray-800 dark:text-white mb-2">Color Psychology</h2>
          <p className="text-[14px] text-gray-500 dark:text-white/50 leading-relaxed">{psychology}</p>
        </section>
      )}
    </div>
  );
}
