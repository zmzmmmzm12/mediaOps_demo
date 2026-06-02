import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-sand p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: '조건에 맞는 캠페인이 없습니다',
    description:
      '상태 필터를 넓히거나 저장해 둔 프리셋을 불러와 다시 확인해 보세요.',
    action: <Button variant="secondary">필터 초기화</Button>,
  },
}
