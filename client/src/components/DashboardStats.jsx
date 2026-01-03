import axios from 'axios';
import { Users, FileText, Heart } from 'lucide-react';

export default function DashboardStats({ stats }) {
	return (
		<div className="p-8">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
				<p className="text-gray-600 mt-1">Platform statistics at a glance</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Total Users */}
				<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
					<div className="flex items-center justify-between mb-4">
						<div className="p-3 bg-white/20 rounded-lg">
							<Users size={32} />
						</div>
						<span className="text-4xl font-bold">{stats.totalUsers || 0}</span>
					</div>
					<h3 className="text-lg font-semibold mb-1">Total Users</h3>
					<p className="text-blue-100 text-sm">Registered platform users</p>
				</div>

				{/* Total Donations */}
				<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
					<div className="flex items-center justify-between mb-4">
						<div className="p-3 bg-white/20 rounded-lg">
							<FileText size={32} />
						</div>
						<span className="text-4xl font-bold">{stats.totalDonations || 0}</span>
					</div>
					<h3 className="text-lg font-semibold mb-1">Active Donations</h3>
					<p className="text-green-100 text-sm">Currently available</p>
				</div>

				{/* Total Success Stories */}
				<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
					<div className="flex items-center justify-between mb-4">
						<div className="p-3 bg-white/20 rounded-lg">
							<Heart size={32} />
						</div>
						<span className="text-4xl font-bold">{stats.totalStories || 0}</span>
					</div>
					<h3 className="text-lg font-semibold mb-1">Success Stories</h3>
					<p className="text-purple-100 text-sm">Completed donations</p>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="mt-8 bg-white rounded-xl shadow-lg p-6">
				<h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 transition-colors">
						<h4 className="font-semibold text-gray-900 mb-1">Recent Activity</h4>
						<p className="text-sm text-gray-600">
							{stats.totalStories || 0} stories shared this month
						</p>
					</div>
					<div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
						<h4 className="font-semibold text-gray-900 mb-1">Platform Health</h4>
						<p className="text-sm text-gray-600">
							All systems operational ✓
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
