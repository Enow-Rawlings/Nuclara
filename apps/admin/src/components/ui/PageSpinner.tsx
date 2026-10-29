export function PageSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex h-full min-h-[200px] items-center justify-center"
    >
      <div
        className="h-7 w-7 animate-spin rounded-full border-2 border-border-grey border-t-scientific-teal"
        aria-hidden="true"
      />
    </div>
  )
}
