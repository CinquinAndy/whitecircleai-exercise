import { cn } from '@/lib/utils'

interface ChatMessage {
	id: string
	role: 'user' | 'assistant' | 'system'
	content: string
}

interface MessageBubbleProps {
	message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
	const isUser = message.role === 'user'

	return (
		<div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}>
			<div
				className={cn(
					'max-w-[80%] rounded-2xl px-4 py-3',
					isUser ? 'bg-primary text-primary-foreground' : 'bg-muted dark:bg-[#303030]'
				)}
			>
				<p className="text-sm whitespace-pre-wrap">{message.content}</p>
			</div>
		</div>
	)
}
