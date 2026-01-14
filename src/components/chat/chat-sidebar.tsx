'use client'

import { ChevronLeft, MessageSquare, MoreHorizontal, Plus, Search, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ChatHistoryItem {
	id: string
	title: string
	date: string
	preview?: string
}

// Mock data for UI scaffold
const mockChatHistory: ChatHistoryItem[] = [
	{ id: '1', title: 'Comment créer une API REST', date: "Aujourd'hui", preview: 'Aide-moi à créer une API...' },
	{ id: '2', title: 'Optimisation React', date: "Aujourd'hui", preview: 'Je veux optimiser mon...' },
	{ id: '3', title: 'Questions TypeScript', date: 'Hier', preview: 'Comment utiliser les generics...' },
	{ id: '4', title: 'Design System', date: 'Hier', preview: 'Je voudrais créer un design...' },
	{ id: '5', title: 'Docker et containerisation', date: '7 derniers jours', preview: 'Explique-moi Docker...' },
	{ id: '6', title: 'Architecture microservices', date: '7 derniers jours', preview: 'Quels sont les avantages...' },
]

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

	// Group conversations by date
	const groupedHistory = mockChatHistory.reduce(
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
						Nouveau chat
					</button>
				</div>

				{/* Search */}
				<div className="p-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Rechercher..."
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
				<div className="p-3 border-t border-border">
					<div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
						<div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
							<User className="h-4 w-4 text-white" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-foreground truncate">Utilisateur</p>
							<p className="text-xs text-muted-foreground">Plan Pro</p>
						</div>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</div>
				</div>
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
