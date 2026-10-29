export function PageSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[200px] items-center justify-center"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border-grey border-t-scientific-teal"
        aria-hidden="true"
      />
    </div>
  )
}
