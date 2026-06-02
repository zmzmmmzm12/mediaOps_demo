import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'

const meta = {
  title: 'UI/Input',
  component: Input,
  args: {
    label: '캠페인 검색',
    placeholder: '검색어를 입력하세요',
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: {
    hint: '검색어는 디바운스 후 URL 필터와 동기화됩니다.',
  },
}
