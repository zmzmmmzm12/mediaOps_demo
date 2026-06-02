import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select, SelectOption } from './Select'

const meta = {
  title: 'UI/Select',
  component: Select,
  args: {
    label: 'Status',
    defaultValue: 'all',
    children: (
      <>
        <SelectOption value="all">All statuses</SelectOption>
        <SelectOption value="active">Active</SelectOption>
        <SelectOption value="paused">Paused</SelectOption>
        <SelectOption value="ended">Ended</SelectOption>
      </>
    ),
  },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
