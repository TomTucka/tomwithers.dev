import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/header.module.css'

const navItems: { label: string; page?: string; link?: string }[] = [
  { label: 'Home', page: '/' },
  { label: 'Posts', page: '/blog' },
  { label: 'About', page: '/about' },
]

const isActive = (page, pathname) => {
  return pathname === page || (page === '/posts' && pathname.startsWith(page))
}

const ogImageUrl = ''
const defaultDescription =
  "Tom Withers' Blog about automation, infrastructure & software development"

export default ({ titlePre = '', description = '' }) => {
  const { asPath } = useRouter()

  const title = [titlePre, 'Tom Withers'].filter(s => s.length > 0).join(' | ')
  const desc = description === '' ? defaultDescription : description
  return (
    <header className={styles.header}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta name="og:title" content={title} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:site" content="@tomtucka" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
      <ul>
        {navItems.map(({ label, page }) => (
          <li key={label}>
            <Link href={page}>
              <a className={isActive(page, asPath) ? 'active' : undefined}>
                {label}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </header>
  )
}
