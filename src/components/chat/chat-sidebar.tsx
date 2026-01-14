'use client'

import { ChevronLeft, MessageSquare, MoreHorizontal, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getAuthToken } from '@/services/pocketbase.client'

interface ChatHistoryItem {
	id: string
	title: string
	date: string
	preview?: string
}

interface ChatSidebarProps {
	isOpen: boolean
	onToggle: () => void
	onNewChat: () => void
	activeConversationId?: string
	onSelectConversation?: (id: string) => void
}

export function ChatSidebar({
	isOpen,
	onToggle,
	onNewChat,
	activeConversationId,
	onSelectConversation,
}: ChatSidebarProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchHistory = async () => {
		setIsLoading(true)
		try {
			const token = getAuthToken()
			if (!token) return

			const response = await fetch('/api/chat/history', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (response.ok) {
				const data = await response.json()
				const conversations = data.conversations || []

				const formattedHistory: ChatHistoryItem[] = conversations.map((conv: any) => {
					// Determine date group
					const date = new Date(conv.updated)
					const now = new Date()
					const diffTime = Math.abs(now.getTime() - date.getTime())
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

					let dateLabel = 'Older'
					if (diffDays <= 1) dateLabel = 'Today'
					else if (diffDays <= 2) dateLabel = 'Yesterday'
					else if (diffDays <= 7) dateLabel = 'Last 7 days'

					// Basic preview from messages if available (or description if implemented)
					// Current schema stores messages in JSON, let's assume we can get a snippet
					// If fetching list, we might not get full messages unless expanded.
					// Assuming the API returns conversation record which has 'messages' json array.
					let preview = ''
					if (conv.messages && Array.isArray(conv.messages) && conv.messages.length > 0) {
						const lastMsg = conv.messages[conv.messages.length - 1]
						preview = lastMsg.content ? lastMsg.content.substring(0, 40) + '...' : ''
					}

					return {
						id: conv.id,
						title: conv.title || 'New conversation',
						date: dateLabel,
						preview,
					}
				})
				setChatHistory(formattedHistory)
			}
		} catch (error) {
			console.error('Failed to fetch chat history', error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (isOpen) {
			fetchHistory()
		}
	}, [isOpen, activeConversationId]) // Refetch when opening or changing conversation (to update order/last msg)

	// Filter based on search query
	const filteredHistory = chatHistory.filter((chat) =>
		chat.title.toLowerCase().includes(searchQuery.toLowerCase())
	)

	// Group conversations by date
	const groupedHistory = filteredHistory.reduce(
		(acc, chat) => {
			if (!acc[chat.date]) {
				acc[chat.date] = []
			}
			acc[chat.date].push(chat)
			return acc
		},
		{} as Record<string, ChatHistoryItem[]>
	)

	return (
		<>
			{/* Sidebar */}
			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 flex flex-col bg-card dark:bg-[#171717] border-r border-border transition-all duration-300',
					isOpen ? 'w-72' : 'w-0 overflow-hidden'
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-border">
					<button
						type="button"
						onClick={onToggle}
						className="p-2 rounded-lg hover:bg-accent dark:hover:bg-[#2a2a2a] transition-colors"
						aria-label="Toggle sidebar"
					>
						<ChevronLeft className="h-5 w-5 text-muted-foreground" />
					</button>
					<button
						type="button"
						onClick={onNewChat}
						className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
					>
						<Plus className="h-4 w-4" />
						New chat
					</button>
				</div>

				{/* Search */}
				<div className="p-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Search..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-lg bg-background dark:bg-[#2a2a2a] text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
				</div>

				{/* Chat History */}
				<div className="flex-1 overflow-y-auto custom-scrollbar px-2">
					{Object.entries(groupedHistory).map(([date, chats]) => (
						<div key={date} className="mb-4">
							<h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{date}</h3>
							<ul className="space-y-1">
								{chats.map(chat => (
									<li key={chat.id}>
										<button
											type="button"
											onClick={() => onSelectConversation?.(chat.id)}
											className={cn(
												'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors group',
												activeConversationId === chat.id
													? 'bg-accent dark:bg-[#2a2a2a]'
													: 'hover:bg-accent/50 dark:hover:bg-[#2a2a2a]/50'
											)}
										>
											<MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
											<span className="flex-1 truncate text-sm text-foreground">{chat.title}</span>
											<button
												type="button"
												className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background dark:hover:bg-[#3a3a3a] transition-all"
												aria-label="More options"
											>
												<MoreHorizontal className="h-4 w-4 text-muted-foreground" />
											</button>
										</button>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Footer */}
				{/* todo: implement user profile + settings and disconnected things */}
				{/* <div className="p-3 border-t border-border">
					<div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
						<div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
							<User className="h-4 w-4 text-white" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-foreground truncate">Utilisateur</p>
						</div>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</div>
				</div> */}
			</aside>

			{/* Toggle button when sidebar is closed */}
			{!isOpen && (
				<button
					type="button"
					onClick={onToggle}
					className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-card dark:bg-[#171717] border border-border hover:bg-accent dark:hover:bg-[#2a2a2a] transition-colors shadow-sm"
					aria-label="Open sidebar"
				>
					<MessageSquare className="h-5 w-5 text-muted-foreground" />
				</button>
			)}
		</>
	)
}
