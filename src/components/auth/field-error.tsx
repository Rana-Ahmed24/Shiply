type FieldErrorProps = {
  messages?: string[];
};

export function FieldError({ messages }: FieldErrorProps) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}
