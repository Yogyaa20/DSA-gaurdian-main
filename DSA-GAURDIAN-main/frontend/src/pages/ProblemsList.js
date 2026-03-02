import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '../App';
import { toast } from 'sonner';
import { Code, Search, Filter, ExternalLink, CheckCircle, Circle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const ProblemsList = ({ currentUser, logoutUser }) => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const topics = [
    'all', 'arrays', 'strings', 'linked-lists', 'trees', 'graphs',
    'dynamic-programming', 'binary-search', 'backtracking'
  ];

  useEffect(() => {
    fetchProblems();
    if (currentUser) {
      fetchUserProgress();
    }
  }, [currentUser]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/problems');
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await api.get(`/users/${currentUser.id}/progress`);
      const progressMap = {};
      response.data.forEach(prog => {
        progressMap[prog.problem_id] = prog.status;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const updateProblemStatus = async (problemId, status) => {
    if (!currentUser) {
      toast.error('Please login to track progress');
      return;
    }

    try {
      await api.post('/progress', {
        user_id: currentUser.id,
        problem_id: problemId,
        status: status,
      });
      
      setUserProgress(prev => ({
        ...prev,
        [problemId]: status
      }));
      
      toast.success(`Problem marked as ${status}`);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesTopic = selectedTopic === 'all' || problem.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (problemId) => {
    const status = userProgress[problemId];
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'in_progress') return <Clock className="h-5 w-5 text-yellow-600" />;
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {currentUser && <Navbar currentUser={currentUser} logoutUser={logoutUser} />}
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {currentUser && <Navbar currentUser={currentUser} logoutUser={logoutUser} />}
      
      <div className="container mx-auto px-6 py-8" data-testid="problems-list-container">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center space-x-3 mb-4">
            <Code className="h-10 w-10 text-indigo-600" />
            <h1 className="text-4xl font-bold gradient-text">DSA Problems</h1>
          </div>
          <p className="text-gray-600 text-lg">Browse and solve curated problems to master DSA</p>
        </div>

        {/* Filters */}
        <Card className="mb-6" data-testid="filters-card">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>

              {/* Topic Filter */}
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger data-testid="topic-filter">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(topic => (
                    <SelectItem key={topic} value={topic}>
                      {topic === 'all' ? 'All Topics' : topic.replace('-', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger data-testid="difficulty-filter">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-indigo-600">{filteredProblems.length}</div>
              <div className="text-sm text-gray-600">Total Problems</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {filteredProblems.filter(p => p.difficulty === 'easy').length}
              </div>
              <div className="text-sm text-gray-600">Easy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {filteredProblems.filter(p => p.difficulty === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-600">
                {filteredProblems.filter(p => p.difficulty === 'hard').length}
              </div>
              <div className="text-sm text-gray-600">Hard</div>
            </CardContent>
          </Card>
        </div>

        {/* Problems List */}
        <Card data-testid="problems-table">
          <CardHeader>
            <CardTitle>Problems ({filteredProblems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProblems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Code className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>No problems found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProblems.map((problem, index) => (
                  <Card key={problem.id} className="border hover:border-indigo-300 transition-colors" data-testid={`problem-item-${problem.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Status Icon */}
                          {currentUser && (
                            <div className="pt-1">
                              {getStatusIcon(problem.id)}
                            </div>
                          )}
                          
                          {/* Problem Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                              <h3 className="text-lg font-semibold">{problem.title}</h3>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{problem.description}</p>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={getDifficultyColor(problem.difficulty)}>
                                {problem.difficulty.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{problem.topic.replace('-', ' ')}</Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-4">
                          {problem.solution_link && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(problem.solution_link, '_blank')}
                              data-testid={`problem-link-${problem.id}`}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Solve
                            </Button>
                          )}
                          
                          {currentUser && (
                            <Select
                              value={userProgress[problem.id] || 'pending'}
                              onValueChange={(value) => updateProblemStatus(problem.id, value)}
                            >
                              <SelectTrigger className="w-32" data-testid={`status-select-${problem.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProblemsList;