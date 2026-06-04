import type { Metadata } from 'next'
import '../src/index.css'
import { AppProviders } from '../src/app/providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://mediaops-dashboard.local'),
  title: {
    default: 'MediaOps Dashboard',
    template: '%s | MediaOps Dashboard',
  },
  description: '광고 운영 현황, 캠페인 성과, 리포트를 한 화면에서 관리하는 MediaOps 관리자 대시보드입니다.',
  openGraph: {
    title: 'MediaOps Dashboard',
    description: '광고 운영 현황, 캠페인 성과, 리포트를 한 화면에서 관리하는 MediaOps 관리자 대시보드입니다.',
    siteName: 'MediaOps Dashboard',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}

