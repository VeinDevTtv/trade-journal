import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTradeStore } from '../store/tradeStore'
import { Goal } from '../types/trade'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'

import { 
  Plus, 
  Target, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  Clock,
  Pause,

  PieChart
} from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export function GoalsView() {
  const { goals, getGoalSummary, addGoal, allocateProfitToGoals, getTradeSummary } = useTradeStore()

  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    profitAllocationPercentage: 0,
    status: 'Active' as 'Active' | 'Completed' | 'Paused',
    category: ''
  })

  const goalSummary = getGoalSummary()
  const tradeSummary = getTradeSummary()
  const [manualAllocationAmount, setManualAllocationAmount] = useState(0)

  const handleAddGoal = () => {
    if (newGoal.title.trim() && newGoal.targetAmount > 0) {
      addGoal({
        ...newGoal,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount),
        profitAllocationPercentage: Number(newGoal.profitAllocationPercentage)
      })
      setNewGoal({
        title: '',
        description: '',
        targetAmount: 0,
        currentAmount: 0,
        priority: 'Medium',
        profitAllocationPercentage: 0,
        status: 'Active',
        category: ''
      })
      setShowAddGoal(false)
    }
  }

  const handleManualAllocation = () => {
    if (manualAllocationAmount > 0) {
      allocateProfitToGoals(manualAllocationAmount)
      setManualAllocationAmount(0)
    }
  }

  const getProgressPercentage = (goal: Goal) => {
    return goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Paused': return <Pause className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  // Data for pie chart
  const chartData = goals.filter(g => g.status === 'Active').map(goal => ({
    name: goal.title,
    value: goal.profitAllocationPercentage,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  return (
    <div className="space-y-6">
      {/* Goals Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goalSummary.totalActiveGoals}</div>
              <p className="text-xs text-muted-foreground">
                {goalSummary.totalCompletedGoals} completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Target</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${goalSummary.totalTargetAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${goalSummary.totalCurrentAmount.toLocaleString()} saved
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goalSummary.totalProgressPercentage.toFixed(1)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(goalSummary.totalProgressPercentage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Allocation</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goalSummary.totalProfitAllocated.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                of trading profits
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Manual Profit Allocation */}
      {goals.filter(g => g.status === 'Active').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Manual Profit Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Allocate Additional Profit ($)
                  </label>
                  <Input
                    type="number"
                    value={manualAllocationAmount || ''}
                    onChange={(e) => setManualAllocationAmount(Number(e.target.value))}
                    placeholder="Enter profit amount to allocate"
                    min="0"
                  />
                </div>
                <Button 
                  onClick={handleManualAllocation}
                  disabled={manualAllocationAmount <= 0}
                  className="whitespace-nowrap"
                >
                  Allocate to Goals
                </Button>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                <p>Current month P&L: <span className={`font-semibold ${tradeSummary.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${tradeSummary.totalProfitLoss.toLocaleString()}
                </span></p>
                <p className="mt-1">
                  Profits are automatically allocated to goals when you add profitable trades. 
                  Use this to allocate additional funds or external profits.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Goals Chart and Add Button */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals Allocation Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Profit Allocation Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No active goals to display
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Goal Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <Target className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Add New Goal</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Set financial targets and track your progress automatically
              </p>
              <Button onClick={() => setShowAddGoal(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first financial goal
                </p>
                <Button onClick={() => setShowAddGoal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(goal.status)}
                        <div>
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </span>
                        <span className="text-sm font-medium">
                          {goal.profitAllocationPercentage}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(getProgressPercentage(goal), 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getProgressPercentage(goal).toFixed(1)}% complete • 
                        ${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddGoal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-4">Create New Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Emergency Fund, New Car, Investment Portfolio"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your goal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Amount ($)</label>
                  <Input
                    type="number"
                    value={newGoal.targetAmount || ''}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
                    placeholder="10000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Current Amount ($)</label>
                  <Input
                    type="number"
                    value={newGoal.currentAmount || ''}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as 'Low' | 'Medium' | 'High' }))}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Profit Allocation (%)</label>
                  <Input
                    type="number"
                    value={newGoal.profitAllocationPercentage || ''}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, profitAllocationPercentage: Number(e.target.value) }))}
                    placeholder="25"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category (Optional)</label>
                <Input
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Emergency Fund, Investment, Purchase"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddGoal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddGoal} className="flex-1">
                Create Goal
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default GoalsView

