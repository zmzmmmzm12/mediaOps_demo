import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: '주요 액션',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '보조 액션',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: '고스트 액션',
  },
}
