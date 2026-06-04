import type { Metadata } from 'next'
import { SettingsPage } from '../../../src/views/SettingsPage'

export const metadata: Metadata = {
  title: '설정',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <SettingsPage />
}
