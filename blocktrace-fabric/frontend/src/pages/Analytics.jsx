import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { TrendingUp, Activity, Download, Calendar, Filter, BarChart3 } from 'lucide-react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [realData, setRealData] = useState({
    totalEvidence: 0,
    verifiedEvidence: 0,
    pendingEvidence: 0,
    categoryData: [],
    organizationActivity: [],
    evidenceTrend: [],
    activityHeatmap: []
  })

  useEffect(() => {
    // Load real data from localStorage
    const evidenceData = JSON.parse(localStorage.getItem('evidenceData') || '[]')
    const custodyChain = JSON.parse(localStorage.getItem('custodyChain') || '{}')

    // Calculate totals
    const total = evidenceData.length
    const verified = evidenceData.filter(e => e.status === 'verified').length
    const pending = evidenceData.filter(e => e.status === 'pending').length

    // Calculate category distribution
    const categoryCount = {}
    evidenceData.forEach(e => {
      categoryCount[e.category] = (categoryCount[e.category] || 0) + 1
    })

    const categoryColors = {
      'Malware': '#ef4444',
      'Ransom Note': '#f59e0b',
      'Network Log': '#3b82f6',
      'Disk Image': '#8b5cf6',
      'Memory Dump': '#10b981',
      'Email': '#ec4899',
      'Other': '#6b7280'
    }

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#6b7280'
    }))

    // Calculate organization activity
    const orgActivity = {}
    evidenceData.forEach(e => {
      const org = e.custodian || 'Unknown'
      if (!orgActivity[org]) {
        orgActivity[org] = { org, submitted: 0, verified: 0, transfers: 0 }
      }
      orgActivity[org].submitted++
      if (e.status === 'verified') {
        orgActivity[org].verified++
      }
    })

    // Count transfers from custody chain
    Object.values(custodyChain).forEach(chain => {
      chain.forEach(record => {
        if (record.action === 'Custody Transferred' && record.from) {
          if (orgActivity[record.from]) {
            orgActivity[record.from].transfers++
          }
        }
      })
    })

    const organizationActivity = Object.values(orgActivity)

    // Calculate evidence trend by month
    const monthCounts = {}
    evidenceData.forEach(e => {
      if (e.collectionDate) {
        const date = new Date(e.collectionDate)
        const month = date.toLocaleString('default', { month: 'short' })
        if (!monthCounts[month]) {
          monthCounts[month] = { month, created: 0, verified: 0, transfers: 0 }
        }
        monthCounts[month].created++
        if (e.status === 'verified') {
          monthCounts[month].verified++
        }
      }
    })

    // Count transfers by month
    Object.values(custodyChain).forEach(chain => {
      chain.forEach(record => {
        if (record.timestamp && record.action === 'Custody Transferred') {
          const date = new Date(record.timestamp)
          const month = date.toLocaleString('default', { month: 'short' })
          if (monthCounts[month]) {
            monthCounts[month].transfers++
          }
        }
      })
    })

    const evidenceTrend = Object.values(monthCounts)

    // Calculate activity heatmap by day and time
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const heatmapData = days.map(day => {
      const dayData = { day, '00-04': 0, '04-08': 0, '08-12': 0, '12-16': 0, '16-20': 0, '20-24': 0 }
      
      // Count evidence by collection time
      evidenceData.forEach(e => {
        if (e.collectionDate) {
          const date = new Date(e.collectionDate)
          const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1] // Adjust Sunday
          const hour = date.getHours()
          
          if (dayName === day) {
            if (hour >= 0 && hour < 4) dayData['00-04']++
            else if (hour >= 4 && hour < 8) dayData['04-08']++
            else if (hour >= 8 && hour < 12) dayData['08-12']++
            else if (hour >= 12 && hour < 16) dayData['12-16']++
            else if (hour >= 16 && hour < 20) dayData['16-20']++
            else if (hour >= 20 && hour < 24) dayData['20-24']++
          }
        }
      })

      // Count custody transfers by time
      Object.values(custodyChain).forEach(chain => {
        chain.forEach(record => {
          if (record.timestamp) {
            const date = new Date(record.timestamp)
            const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]
            const hour = date.getHours()
            
            if (dayName === day) {
              if (hour >= 0 && hour < 4) dayData['00-04']++
              else if (hour >= 4 && hour < 8) dayData['04-08']++
              else if (hour >= 8 && hour < 12) dayData['08-12']++
              else if (hour >= 12 && hour < 16) dayData['12-16']++
              else if (hour >= 16 && hour < 20) dayData['16-20']++
              else if (hour >= 20 && hour < 24) dayData['20-24']++
            }
          }
        })
      })

      return dayData
    })

    setRealData({
      totalEvidence: total,
      verifiedEvidence: verified,
      pendingEvidence: pending,
      categoryData,
      organizationActivity,
      evidenceTrend: evidenceTrend.length > 0 ? evidenceTrend : [{ month: 'Current', created: total, verified, transfers: 0 }],
      activityHeatmap: heatmapData
    })
  }, [])

  // Data generation based on time range
  const getEvidenceTrendData = () => {
    if (timeRange === '7days') return realData.evidenceTrend.slice(-1)
    if (timeRange === '1month') return realData.evidenceTrend.slice(-1)
    if (timeRange === '3months') return realData.evidenceTrend.slice(-3)
    if (timeRange === '6months') return realData.evidenceTrend.slice(-6)
    return realData.evidenceTrend
  }
  
  const evidenceTrend = getEvidenceTrendData()
  const categoryData = realData.categoryData
  const organizationActivity = realData.organizationActivity
  const activityHeatmap = realData.activityHeatmap

  const verificationRate = realData.verifiedEvidence > 0 
    ? Math.round((realData.verifiedEvidence / realData.totalEvidence) * 100) 
    : 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-abyss border border-neon/30 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold glow-text mb-1">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive insights into evidence management</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => {
              const newFilter = categoryFilter === 'all' ? 'Malware' : 'all'
              setCategoryFilter(newFilter)
              alert(`Filter set to: ${newFilter}`)
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter ({categoryFilter})
          </button>
          <button 
            onClick={() => {
              const data = JSON.stringify({ evidenceTrend, categoryData, organizationActivity }, null, 2)
              const blob = new Blob([data], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-neon" />
          <span className="text-gray-300 font-medium">Time Range:</span>
          <div className="flex gap-2">
            {['7days', '1month', '3months', '6months', '1year'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-neon text-midnight'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {range === '7days' ? '7 Days' : range === '1month' ? '1 Month' : range === '3months' ? '3 Months' : range === '6months' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Evidence</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="text-3xl font-bold text-neon mb-1">{realData.totalEvidence}</div>
          <div className="text-sm text-success">{realData.pendingEvidence} pending</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Verification Rate</span>
            <Activity className="w-4 h-4 text-neon" />
          </div>
          <div className="text-3xl font-bold text-neon mb-1">{verificationRate}%</div>
          <div className="text-sm text-success">{realData.verifiedEvidence} of {realData.totalEvidence} verified</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Organizations</span>
            <BarChart3 className="w-4 h-4 text-warning" />
          </div>
          <div className="text-3xl font-bold text-neon mb-1">{organizationActivity.length}</div>
          <div className="text-sm text-gray-400">Active custodians</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Categories</span>
            <Activity className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-bold text-neon mb-1">{categoryData.length}</div>
          <div className="text-sm text-gray-400">Evidence types</div>
        </div>
      </motion.div>

      {/* Evidence Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Evidence Submission & Verification Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={evidenceTrend}>
            <defs>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00BFFF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="created" stroke="#00BFFF" fillOpacity={1} fill="url(#colorCreated)" />
            <Area type="monotone" dataKey="verified" stroke="#10b981" fillOpacity={1} fill="url(#colorVerified)" />
            <Area type="monotone" dataKey="transfers" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTransfers)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category Distribution & Organization Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4">Evidence by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-gray-300">{cat.name}</span>
                <span className="text-gray-400">({cat.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Organization Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4">Organization Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={organizationActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="org" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="submitted" fill="#00BFFF" radius={[8, 8, 0, 0]} />
              <Bar dataKey="verified" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="transfers" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Verification Rate Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Verification Rate & Average Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={verificationRate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis yAxisId="left" stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="rate"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
              name="Verification Rate (%)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgTime"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', r: 5 }}
              activeDot={{ r: 7 }}
              name="Avg Time (hours)"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Activity Heatmap (By Day & Time)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-gray-400 text-sm py-2 px-3">Day</th>
                <th className="text-center text-gray-400 text-sm py-2 px-3">00-04</th>
                <th className="text-center text-gray-400 text-sm py-2 px-3">04-08</th>
                <th className="text-center text-gray-400 text-sm py-2 px-3">08-12</th>
                <th className="text-center text-gray-400 text-sm py-2 px-3">12-16</th>
                <th className="text-center text-gray-400 text-sm py-2 px-3">16-20</th>
                <th className="text-center text-gray-400 text-sm py-2 px-3">20-24</th>
              </tr>
            </thead>
            <tbody>
              {activityHeatmap.map((row, idx) => (
                <tr key={idx}>
                  <td className="text-gray-300 font-medium py-2 px-3">{row.day}</td>
                  {['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'].map(time => {
                    const value = row[time]
                    const intensity = Math.min(value / 45, 1)
                    return (
                      <td key={time} className="py-2 px-3">
                        <div
                          className="w-full h-10 rounded flex items-center justify-center text-sm font-medium transition-transform hover:scale-110"
                          style={{
                            backgroundColor: `rgba(0, 191, 255, ${intensity * 0.8})`,
                            color: intensity > 0.5 ? '#0D1117' : '#9ca3af'
                          }}
                        >
                          {value}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-gray-400">Activity Level:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(0, 191, 255, 0.2)' }} />
            <span className="text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(0, 191, 255, 0.5)' }} />
            <span className="text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(0, 191, 255, 0.8)' }} />
            <span className="text-gray-400">High</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Analytics
