import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Shield, TrendingUp, DollarSign, Server, AlertTriangle, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

function RansomwareDashboard() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Load from localStorage
      const savedData = localStorage.getItem('ransomwareIncidents')
      const data = savedData ? JSON.parse(savedData) : []
      setIncidents(data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch ransomware data')
    } finally {
      setLoading(false)
    }
  }

  // Analytics calculations
  const stats = {
    totalIncidents: incidents.length,
    activeIncidents: incidents.filter(i => i.status === 'ACTIVE').length,
    resolvedIncidents: incidents.filter(i => i.status === 'RESOLVED').length,
    totalInfectedSystems: incidents.reduce((sum, i) => sum + (i.infectedSystems?.length || 0), 0),
    totalPayments: incidents.reduce((sum, i) => sum + (i.paymentTrail?.length || 0), 0),
    totalDemandAmount: incidents.reduce((sum, i) => sum + (parseFloat(i.metadata?.demandAmount) || 0), 0)
  }

  // Incidents by status
  const statusData = [
    { name: 'Active', value: incidents.filter(i => i.status === 'ACTIVE').length },
    { name: 'Investigating', value: incidents.filter(i => i.status === 'INVESTIGATING').length },
    { name: 'Contained', value: incidents.filter(i => i.status === 'CONTAINED').length },
    { name: 'Resolved', value: incidents.filter(i => i.status === 'RESOLVED').length },
    { name: 'Closed', value: incidents.filter(i => i.status === 'CLOSED').length }
  ].filter(item => item.value > 0)

  // Incidents by ransomware family
  const familyCount = {}
  incidents.forEach(i => {
    familyCount[i.ransomwareFamily] = (familyCount[i.ransomwareFamily] || 0) + 1
  })
  const familyData = Object.entries(familyCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Severity distribution
  const severityData = [
    { name: 'Critical', value: incidents.filter(i => i.metadata?.severity === 'CRITICAL').length },
    { name: 'High', value: incidents.filter(i => i.metadata?.severity === 'HIGH').length },
    { name: 'Medium', value: incidents.filter(i => i.metadata?.severity === 'MEDIUM').length },
    { name: 'Low', value: incidents.filter(i => i.metadata?.severity === 'LOW').length }
  ].filter(item => item.value > 0)

  // Timeline data (incidents per month)
  const timelineData = incidents.reduce((acc, incident) => {
    const date = new Date(incident.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    acc[monthKey] = (acc[monthKey] || 0) + 1
    return acc
  }, {})
  const timelineChartData = Object.entries(timelineData)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)

  // Targeted sectors
  const sectorCount = {}
  incidents.forEach(i => {
    const sectors = i.metadata?.targetedSectors || []
    sectors.forEach(sector => {
      sectorCount[sector] = (sectorCount[sector] || 0) + 1
    })
  })
  const sectorData = Object.entries(sectorCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Top ransom demands
  const topDemands = incidents
    .filter(i => i.metadata?.demandAmount > 0)
    .map(i => ({
      incident: i.incidentId,
      amount: parseFloat(i.metadata.demandAmount),
      currency: i.metadata.demandCurrency,
      family: i.ransomwareFamily
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyber-blue border-r-transparent"></div>
          <p className="text-gray-400 mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-red-500" size={36} />
          Ransomware Analytics Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Real-time insights and threat intelligence</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Incidents', value: stats.totalIncidents, icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
          { label: 'Active Cases', value: stats.activeIncidents, icon: Shield, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          { label: 'Resolved', value: stats.resolvedIncidents, icon: Shield, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Infected Systems', value: stats.totalInfectedSystems, icon: Server, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Payment Trails', value: stats.totalPayments, icon: DollarSign, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
          { label: 'Total Demands (BTC)', value: stats.totalDemandAmount.toFixed(2), icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${stat.bgColor} border border-cyber-blue/20 rounded-lg p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-dark-lighter border border-cyber-blue/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Incident Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Ransomware Families */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-dark-lighter border border-cyber-blue/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Top Ransomware Families</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={familyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0ea5e9' }} />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-lighter border border-cyber-blue/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Severity Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Targeted Sectors */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-lighter border border-cyber-blue/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Most Targeted Sectors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0ea5e9' }} />
              <Bar dataKey="value" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Timeline Chart */}
      {timelineChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-lighter border border-cyber-blue/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Incident Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0ea5e9' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} name="Incidents" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Top Ransom Demands Table */}
      {topDemands.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-lighter border border-cyber-blue/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="text-yellow-500" />
            Top Ransom Demands
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyber-blue/20">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Incident ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Ransomware Family</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold">Demand Amount</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-semibold">Currency</th>
                </tr>
              </thead>
              <tbody>
                {topDemands.map((demand, index) => (
                  <tr key={index} className="border-b border-cyber-blue/10 hover:bg-dark transition-colors">
                    <td className="py-3 px-4 text-white font-mono">{demand.incident}</td>
                    <td className="py-3 px-4 text-gray-300">{demand.family}</td>
                    <td className="py-3 px-4 text-right text-yellow-400 font-bold">{demand.amount.toFixed(8)}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{demand.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RansomwareDashboard
