import type { Metadata } from 'next'
import { LoginPage } from '../../src/views/LoginPage'

export const metadata: Metadata = {
  title: '로그인',
  description: 'MediaOps Dashboard 데모 계정을 선택하고 관리자 화면을 확인할 수 있습니다.',
}

export default function Page() {
  return <LoginPage />
}
