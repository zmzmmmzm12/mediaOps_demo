import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { ErrorStatePanel } from './ErrorStatePanel'

const meta = {
  title: 'UI/ErrorStatePanel',
  component: ErrorStatePanel,
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-sand p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorStatePanel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: '대시보드 요청에 실패했습니다',
    message: '목업 API 응답을 받지 못했습니다. 다시 시도해 주세요.',
    action: <Button variant="secondary">다시 시도</Button>,
  },
}
