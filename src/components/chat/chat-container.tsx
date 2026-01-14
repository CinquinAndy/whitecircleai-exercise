'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatSidebar } from './chat-sidebar'
import { MessageBubble } from './message-bubble'
import { PromptInput } from './prompt-input'

interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
}

export function ChatContainer() {
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isSidebarOpen, setIsSidebarOpen] = useState(true)
	const [activeConversationId, setActiveConversationId] = useState<string | undefined>()

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const handleNewChat = () => {
		setMessages([])
		setActiveConversationId(undefined)
		setError(null)
	}

	const handleSelectConversation = (id: string) => {
		// For now, just set the active conversation (no actual loading of history yet)
		setActiveConversationId(id)
		setMessages([])
	}

	const handleSendMessage = async (message: string) => {
		if (!message.trim()) return

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: 'user',
			content: message,
		}

		setMessages(prev => [...prev, userMessage])
		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [...messages, userMessage].map(m => ({
						role: m.role,
						content: m.content,
					})),
				}),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const reader = response.body?.getReader()
			const decoder = new TextDecoder()

			const assistantMessage: Message = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: '',
			}

			setMessages(prev => [...prev, assistantMessage])

			if (reader) {
				while (true) {
					const { done, value } = await reader.read()
					if (done) break

					const chunk = decoder.decode(value, { stream: true })
					assistantMessage.content += chunk

					setMessages(prev =>
						prev.map(m => (m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m))
					)
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen bg-background dark:bg-[#212121]">
			{/* Sidebar */}
			<ChatSidebar
				isOpen={isSidebarOpen}
				onToggle={() => setIsSidebarOpen(prev => !prev)}
				onNewChat={handleNewChat}
				activeConversationId={activeConversationId}
				onSelectConversation={handleSelectConversation}
			/>

			{/* Main Chat Area */}
			<main
				className={`flex-1 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
					isSidebarOpen ? 'ml-72' : 'ml-0'
				}`}
			>
				<div className="w-full max-w-2xl flex flex-col h-[90vh]">
					{messages.length === 0 ? (
						<div className="flex-1 flex items-center justify-center">
							<p className="text-center text-3xl text-foreground font-medium">How Can I Help You?</p>
						</div>
					) : (
						<div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
							{messages.map(message => (
								<MessageBubble key={message.id} message={message} />
							))}
							{isLoading && messages[messages.length - 1]?.role === 'user' && (
								<div className="flex justify-start mb-4">
									<div className="bg-muted dark:bg-[#303030] rounded-2xl px-4 py-3">
										<div className="flex space-x-1">
											<div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
											<div
												className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
												style={{ animationDelay: '0.1s' }}
											/>
											<div
												className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
												style={{ animationDelay: '0.2s' }}
											/>
										</div>
									</div>
								</div>
							)}
							{error && (
								<div className="flex justify-center mb-4">
									<div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 text-sm">Error: {error}</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
					)}
					<PromptInput onSubmit={handleSendMessage} isLoading={isLoading} />
				</div>
			</main>
		</div>
	)
}
