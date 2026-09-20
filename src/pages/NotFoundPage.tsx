import { Link } from '@/components/Link'

export default function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-lg font-semibold tracking-tight">Page not found</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        <Link to="/" className="underline underline-offset-2 hover:text-foreground">
          Back to the explorer
        </Link>
      </p>
    </div>
  )
}
