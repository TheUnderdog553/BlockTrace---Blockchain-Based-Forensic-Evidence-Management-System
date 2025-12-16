import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Users,
  Clock,
  Database
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    evidenceData: [],
    categoryData: [],
    recentActivity: []
  })

  useEffect(() => {
    // Load real data from localStorage
    const evidenceData = JSON.parse(localStorage.getItem('evidenceData') || '[]')
    const custodyChain = JSON.parse(localStorage.getItem('custodyChain') || '{}')
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')

    // Calculate stats
    const totalEvidence = evidenceData.length
    const verifiedEvidence = evidenceData.filter(e => e.status === 'verified').length
    const pendingEvidence = evidenceData.filter(e => e.status === 'pending').length
    
    // Count active cases (unique case IDs)
    const uniqueCases = new Set(evidenceData.map(e => e.caseId).filter(Boolean))
    const activeCases = uniqueCases.size

    const stats = [
      {
        icon: FileText,
        label: 'Total Evidence',
        value: totalEvidence.toString(),
        change: `${pendingEvidence} pending`,
        trend: 'up',
        color: 'neon'
      },
      {
        icon: ShieldCheck,
        label: 'Verified',
        value: verifiedEvidence.toString(),
        change: `${Math.round((verifiedEvidence / totalEvidence) * 100) || 0}% verified`,
        trend: 'up',
        color: 'success'
      },
      {
        icon: AlertTriangle,
        label: 'Pending Review',
        value: pendingEvidence.toString(),
        change: 'Review needed',
        trend: pendingEvidence > 0 ? 'down' : 'up',
        color: 'warning'
      },
      {
        icon: Activity,
        label: 'Active Cases',
        value: activeCases.toString(),
        change: 'Ongoing',
        trend: 'up',
        color: 'accent'
      },
    ]

    // Calculate evidence timeline by month
    const monthCounts = {}
    evidenceData.forEach(e => {
      if (e.collectionDate) {
        const date = new Date(e.collectionDate)
        const month = date.toLocaleString('default', { month: 'short' })
        monthCounts[month] = (monthCounts[month] || 0) + 1
      }
    })
    const timelineData = Object.entries(monthCounts).map(([month, count]) => ({ month, count }))

    // Calculate category distribution
    const categoryCount = {}
    evidenceData.forEach(e => {
      const category = e.category || 'Other'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
    const categoryChartData = Object.entries(categoryCount).map(([category, count]) => ({ category, count }))

    // Generate recent activity from notifications and custody transfers
    const activityList = []
    
    // Add from notifications
    notifications.slice(-5).reverse().forEach(notif => {
      activityList.push({
        id: notif.evidenceId || 'N/A',
        action: notif.message,
        org: notif.from || 'System',
        time: getTimeAgo(notif.timestamp),
        type: notif.type || 'create'
      })
    })

    // Add from recent custody transfers
    Object.entries(custodyChain).slice(-5).forEach(([evidenceId, chain]) => {
      const latestTransfer = chain[chain.length - 1]
      if (latestTransfer) {
        activityList.push({
          id: evidenceId,
          action: latestTransfer.action || 'Custody Transferred',
          org: latestTransfer.to || latestTransfer.custodian || 'Unknown',
          time: getTimeAgo(latestTransfer.timestamp),
          type: 'transfer'
        })
      }
    })

    // Sort by time and take latest 5
    const recentActivity = activityList.slice(0, 5)

    setDashboardData({
      stats,
      evidenceData: timelineData.length > 0 ? timelineData : [{ month: 'Current', count: totalEvidence }],
      categoryData: categoryChartData,
      recentActivity
    })
  }, [])

  // Helper function to calculate time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now'
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon to-accent mb-2">
          Evidence Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-400">Real-time forensic evidence monitoring and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color} mb-2`}>{stat.value}</p>
                <div className="flex items-center space-x-2">
                  <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`} />
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}/10 border border-${stat.color}/30`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Timeline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card-hover"
        >
          <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
            <Clock className="w-5 h-5 text-neon mr-2" />
            Evidence Timeline
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardData.evidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#122B39" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#122B39', 
                  border: '1px solid rgba(0, 191, 255, 0.3)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#00BFFF" 
                strokeWidth={3}
                dot={{ fill: '#00BFFF', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Evidence Categories */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-hover"
        >
          <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
            <Database className="w-5 h-5 text-accent mr-2" />
            Evidence by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.categoryData} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#122B39" />
              <XAxis 
                dataKey="category" 
                stroke="#9CA3AF" 
                angle={-35} 
                textAnchor="end" 
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#122B39', 
                  border: '1px solid rgba(0, 191, 255, 0.3)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-hover lg:col-span-2"
        >
          <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
            <Activity className="w-5 h-5 text-neon mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-lg bg-abyss/30 border border-neon/10 hover:border-neon/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'create' ? 'bg-success/20 border border-success/30' :
                  activity.type === 'transfer' ? 'bg-warning/20 border border-warning/30' :
                  activity.type === 'verify' ? 'bg-neon/20 border border-neon/30' :
                  'bg-accent/20 border border-accent/30'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    activity.type === 'create' ? 'text-success' :
                    activity.type === 'transfer' ? 'text-warning' :
                    activity.type === 'verify' ? 'text-neon' :
                    'text-accent'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-100">{activity.action}</p>
                  <p className="text-sm text-gray-400">
                    <span className="font-mono text-neon">{activity.id}</span> • {activity.org}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-hover space-y-4"
        >
          <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
            <Users className="w-5 h-5 text-accent mr-2" />
            Network Status
          </h3>
          
          {/* Peers */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Active Peers</p>
            <div className="space-y-2">
              {['Forensics', 'Police', 'Court'].map((org) => (
                <div key={org} className="flex items-center justify-between p-3 rounded-lg bg-abyss/30 border border-success/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-100">{org}Org</span>
                  </div>
                  <span className="text-xs text-success">Online</span>
                </div>
              ))}
            </div>
          </div>

          {/* Orderer */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Orderer Status</p>
            <div className="p-3 rounded-lg bg-abyss/30 border border-neon/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-100">Raft Consensus</span>
                <span className="badge-success">Active</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Block Height: 1,247</p>
                <p>TPS: 12.3</p>
                <p>Latency: 1.2s</p>
              </div>
            </div>
          </div>

          {/* Chaincode */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Chaincode</p>
            <div className="p-3 rounded-lg bg-abyss/30 border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-100">Evidence v1.0</span>
                <span className="badge-info">Committed</span>
              </div>
              <div className="text-xs text-gray-400">
                <p>Sequence: 1</p>
                <p>Endorsement: Majority</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
