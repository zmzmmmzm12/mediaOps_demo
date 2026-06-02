import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { PageHeader } from './PageHeader'

const meta = {
  title: 'UI/PageHeader',
  component: PageHeader,
  args: {
    eyebrow: '캠페인',
    title: '캠페인 탐색',
    description: '검색, 필터, 정렬, 내보내기로 캠페인 성과를 빠르게 확인합니다.',
    actions: <Button variant="secondary">CSV 다운로드</Button>,
  },
} satisfies Meta<typeof PageHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
