// Small box for an error or a confirmation, used on almost every page.

type Props = {
  text: string;
  type?: "error" | "success" | "info";
};

export function Message({ text, type = "info" }: Props) {
  const className =
    type === "error"
      ? "message message-error"
      : type === "success"
        ? "message message-success"
        : "message";

  return (
    <p className={className} role={type === "error" ? "alert" : undefined}>
      {text}
    </p>
  );
}
