export interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "불러오는 중..." }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
