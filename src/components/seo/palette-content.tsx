interface PaletteContentProps {
  title: string;
  description: string;
  applications: string;
  psychology: string;
}

export function PaletteContent({
  title,
  description,
  applications,
  psychology,
}: PaletteContentProps) {
  return (
    <article className="prose prose-gray max-w-none mt-12 pt-8 border-t border-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

      <section>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700">Practical Applications</h2>
        <div
          className="text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: applications.replace(/\n/g, "<br/>") }}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700">Color Psychology</h2>
        <p className="text-gray-600 leading-relaxed">{psychology}</p>
      </section>
    </article>
  );
}
