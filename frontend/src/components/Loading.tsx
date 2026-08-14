export function Loading({ text = "Loading..." }: { text?: string }) {
  return <p className="loading">{text}</p>;
}

export function EmptyState({ text }: { text: string }) {
  return <p className="empty">{text}</p>;
}
