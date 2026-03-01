import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { api } from '../App';
import { toast } from 'sonner';
import { 
  Code, LogOut, Sparkles, TrendingUp, Target, BookOpen, 
  CheckCircle2, Clock, AlertCircle, BarChart3 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Dashboard = ({ currentUser, logoutUser }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [currentUser, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const statsResponse = await api.get(`/users/${currentUser.id}/dashboard-stats`);
      setStats(statsResponse.data);
      
      // Fetch user roadmaps
      const roadmapsResponse = await api.get(`/users/${currentUser.id}/roadmaps`);
      setRoadmaps(roadmapsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar currentUser={currentUser} logoutUser={logoutUser} />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar currentUser={currentUser} logoutUser={logoutUser} />
      
      <div className="container mx-auto px-6 py-8" data-testid="dashboard-container">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{currentUser.username}</span>! 👋
          </h1>
          <p className="text-gray-600">Track your progress and continue your learning journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-indigo-100" data-testid="stat-total-problems">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Problems</CardTitle>
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_problems || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100" data-testid="stat-completed">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.completed_problems || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100" data-testid="stat-in-progress">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats?.in_progress_problems || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100" data-testid="stat-completion-rate">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats?.completion_rate ? stats.completion_rate.toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {stats && stats.total_problems > 0 && (
          <Card className="mb-8" data-testid="progress-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={stats.completion_rate} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{stats.completed_problems} completed</span>
                <span>{stats.total_problems} total</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white cursor-pointer card-hover" 
                onClick={() => navigate('/generate-roadmap')}
                data-testid="quick-action-generate-roadmap">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-indigo-600 mb-2" />
              <CardTitle>Generate New Roadmap</CardTitle>
              <CardDescription>Create an AI-powered personalized learning path</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Generating →</Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white cursor-pointer card-hover"
                onClick={() => navigate('/problems')}
                data-testid="quick-action-browse-problems">
            <CardHeader>
              <Code className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Browse Problems</CardTitle>
              <CardDescription>Explore our curated collection of DSA problems</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">View Problems →</Button>
            </CardContent>
          </Card>
        </div>

        {/* My Roadmaps */}
        <Card data-testid="roadmaps-section">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              My Roadmaps
            </CardTitle>
            <CardDescription>Your personalized learning paths</CardDescription>
          </CardHeader>
          <CardContent>
            {roadmaps.length === 0 ? (
              <div className="text-center py-12" data-testid="no-roadmaps-message">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't generated any roadmaps yet</p>
                <Button onClick={() => navigate('/generate-roadmap')}>
                  Generate Your First Roadmap
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmaps.map((roadmap) => (
                  <Card key={roadmap.id} className="border hover:border-indigo-300 transition-colors cursor-pointer"
                        onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                        data-testid={`roadmap-item-${roadmap.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{roadmap.title}</h3>
                          <p className="text-gray-600 mb-3">{roadmap.description}</p>
                          <div className="flex space-x-2">
                            <Badge variant="secondary">{roadmap.skill_level}</Badge>
                            <Badge variant="outline">{roadmap.duration_weeks} weeks</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">View →</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Problems by Difficulty */}
        {stats && Object.keys(stats.problems_by_difficulty || {}).length > 0 && (
          <Card className="mt-8" data-testid="difficulty-breakdown">
            <CardHeader>
              <CardTitle>Problems by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.problems_by_difficulty).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        difficulty === 'easy' ? 'default' : 
                        difficulty === 'medium' ? 'secondary' : 
                        'destructive'
                      }>
                        {difficulty.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="font-semibold">{count} problems</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
