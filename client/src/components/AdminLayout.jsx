import { LayoutDashboard, Users, MessageSquare, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ activeTab, onTabChange, onLogout, children }) {
	const navItems = [
		{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ id: 'users', label: 'User Management', icon: Users },
		{ id: 'feedback', label: 'Feedback', icon: MessageSquare },
	];

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Dark Sidebar */}
			<aside className="w-64 bg-gray-900 text-white flex flex-col">
				{/* Brand */}
				<div className="p-6 border-b border-gray-800">
					<h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
						Command Center
					</h1>
					<p className="text-xs text-gray-400 mt-1">Admin Portal</p>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-4 space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeTab === item.id;
						return (
							<button
								key={item.id}
								onClick={() => onTabChange(item.id)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
									isActive
										? 'bg-green-600 text-white shadow-lg'
										: 'text-gray-300 hover:bg-gray-800 hover:text-white'
								}`}
							>
								<Icon size={20} />
								<span className="font-medium">{item.label}</span>
							</button>
						);
					})}
				</nav>

				{/* Back to Map Button */}
				<div className="p-4 border-t border-gray-800">
					<button
						onClick={onLogout}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-lg"
					>
						<ArrowLeft size={20} />
						<span className="font-bold">Back to Map</span>
					</button>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 overflow-auto bg-gray-50">
				{children}
			</main>
		</div>
	);
}
