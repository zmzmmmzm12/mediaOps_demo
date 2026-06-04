import type { Metadata } from 'next'
import { ForbiddenPage } from '../../src/views/ForbiddenPage'

export const metadata: Metadata = {
  title: '접근 제한',
}

export default function Page() {
  return <ForbiddenPage />
}
