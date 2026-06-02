import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { PageHeader } from './PageHeader'

const meta = {
  title: 'UI/PageHeader',
  component: PageHeader,
  args: {
    eyebrow: 'Campaigns',
    title: 'Campaign explorer',
    description: 'Search, filter, sort, and export campaign performance.',
    actions: <Button variant="secondary">Download CSV</Button>,
  },
} satisfies Meta<typeof PageHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
