type ErrorBannerProps = {
  message: string | null | undefined;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <p className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-400">
      {message}
    </p>
  );
}
