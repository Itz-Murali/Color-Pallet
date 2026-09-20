import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { CREATORS, SITE } from '@/data/site'
import type { Creator } from '@/data/site'
import { ROUTES } from '@/lib/router'
import { BrandLogo } from './BrandLogo'
import { Link } from './Link'

const PROJECT_LINKS = [
  { label: 'Source code', href: SITE.repoUrl },
  { label: 'Report an issue', href: `${SITE.repoUrl}/issues` },
  { label: 'Contributing', href: `${SITE.repoUrl}/blob/main/CONTRIBUTING.md` },
  { label: 'MIT license', href: `${SITE.repoUrl}/blob/main/LICENSE` },
]

const linkClass = 'text-[13px] text-muted-foreground transition-colors hover:text-foreground'

export function Footer() {
  return (
    <footer className="border-t bg-panel pb-20 md:pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 lg:grid-cols-[1.2fr_0.7fr_0.9fr_1.6fr]">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <BrandLogo size={28} />
              {SITE.name}
            </div>
            <p className="mt-2 max-w-xs text-[13px] text-muted-foreground">{SITE.tagline}</p>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground">
              Runs in your browser. No accounts, no analytics, no tracking.
            </p>
          </div>

          <nav aria-labelledby="footer-tools">
            <h2 id="footer-tools" className="mb-3 text-xs font-medium">
              Tools
            </h2>
            <ul className="space-y-2">
              {ROUTES.map((route) => (
                <li key={route.path}>
                  <Link to={route.path} className={linkClass}>
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-project">
            <h2 id="footer-project" className="mb-3 text-xs font-medium">
              Project
            </h2>
            <ul className="space-y-2">
              {PROJECT_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer" className={`${linkClass} inline-flex items-center gap-1`}>
                    {link.label}
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section id="creators" aria-labelledby="footer-creators" className="col-span-2 lg:col-span-1">
            <h2 id="footer-creators" className="mb-3 text-xs font-medium">
              Creators
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {CREATORS.map((creator) => (
                <li key={creator.handle}>
                  <CreatorCard creator={creator} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-1 border-t py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Released under the MIT license.
          </p>
          <p>
            Designed and built by{' '}
            {CREATORS.map((creator, index) => (
              <span key={creator.handle}>
                {index > 0 && (index === CREATORS.length - 1 ? ' and ' : ', ')}
                <a
                  href={creator.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {creator.name}
                </a>
              </span>
            ))}
            .
          </p>
        </div>
      </div>
    </footer>
  )
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <a
      href={creator.githubUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-md border p-2 transition-colors hover:bg-muted"
    >
      <Avatar name={creator.name} src={creator.imageUrl} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{creator.name}</span>
        <span className="block truncate text-xs text-muted-foreground">@{creator.handle}</span>
      </span>
      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
    </a>
  )
}

function Avatar({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-semibold"
      >
        {name.charAt(0)}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="size-10 shrink-0 rounded-md border bg-muted object-cover"
    />
  )
}
