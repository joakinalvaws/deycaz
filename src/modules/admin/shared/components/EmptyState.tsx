export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
    </div>
  );
}
