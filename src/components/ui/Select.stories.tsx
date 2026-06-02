import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select, SelectOption } from './Select'

const meta = {
  title: 'UI/Select',
  component: Select,
  args: {
    label: '상태',
    defaultValue: 'all',
    children: (
      <>
        <SelectOption value="all">전체 상태</SelectOption>
        <SelectOption value="active">운영 중</SelectOption>
        <SelectOption value="paused">일시중지</SelectOption>
        <SelectOption value="ended">종료</SelectOption>
      </>
    ),
  },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
