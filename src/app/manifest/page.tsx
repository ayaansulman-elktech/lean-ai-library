import { getManifest } from '@/lib/api/api';

export default function ManifestPage() {
  const manifest = getManifest();

  const details = [
    { label: 'Generated At', value: new Date(manifest.generatedAt).toLocaleString() },
    { label: 'Generator Version', value: manifest.generatorVersion },
    { label: 'Schema Version', value: manifest.schemaVersion },
    { label: 'Total Assets', value: manifest.assetCount },
    { label: 'Total Categories', value: manifest.categoryCount },
    { label: 'Repository', value: manifest.repository },
    { label: 'Branch', value: manifest.branch },
    { label: 'Commit', value: manifest.commit },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Build Manifest</h1>
        <p className="text-xl text-muted-foreground">
          Detailed information about the current static build.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-xl font-semibold">Build Details</h2>
        </div>
        <div className="divide-y divide-border">
          {details.map((detail, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center p-6 gap-2">
              <div className="w-1/3 text-sm font-medium text-muted-foreground">
                {detail.label}
              </div>
              <div className="flex-1 text-base font-mono text-foreground break-all">
                {detail.value || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
