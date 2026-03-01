import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '../App';
import { toast } from 'sonner';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const RoadmapGenerator = ({ currentUser, logoutUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    skill_level: currentUser?.skill_level || 'beginner',
    duration_weeks: 12,
    focus_topics: [],
    time_per_day: '1-2 hours',
  });
  const [loading, setLoading] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);

  const topicOptions = [
    'arrays', 'strings', 'linked-lists', 'trees', 'graphs', 
    'dynamic-programming', 'binary-search', 'backtracking', 
    'greedy', 'sorting', 'hashing'
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const toggleTopic = (topic) => {
    setFormData(prev => ({
      ...prev,
      focus_topics: prev.focus_topics.includes(topic)
        ? prev.focus_topics.filter(t => t !== topic)
        : [...prev.focus_topics, topic]
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/generate-roadmap', {
        user_id: currentUser.id,
        skill_level: formData.skill_level,
        duration_weeks: parseInt(formData.duration_weeks),
        focus_topics: formData.focus_topics.length > 0 ? formData.focus_topics : null,
        time_per_day: formData.time_per_day,
      });

      setGeneratedRoadmap(response.data);
      toast.success('Roadmap generated successfully!');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar currentUser={currentUser} logoutUser={logoutUser} />
      
      <div className="container mx-auto px-6 py-8" data-testid="roadmap-generator-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="h-10 w-10 text-indigo-600" />
              <h1 className="text-4xl font-bold gradient-text">Generate AI Roadmap</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Create a personalized DSA learning path tailored to your goals and skill level
            </p>
          </div>

          {!generatedRoadmap ? (
            <Card className="border-2" data-testid="roadmap-form">
              <CardHeader>
                <CardTitle>Customize Your Roadmap</CardTitle>
                <CardDescription>Tell us about your learning preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                  {/* Skill Level */}
                  <div>
                    <Label htmlFor="skill_level" className="text-base font-semibold">Skill Level</Label>
                    <Select
                      value={formData.skill_level}
                      onValueChange={(value) => setFormData({ ...formData, skill_level: value })}
                    >
                      <SelectTrigger className="mt-2" data-testid="skill-level-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - Just getting started</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Some DSA knowledge</SelectItem>
                        <SelectItem value="advanced">Advanced - Strong foundation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div>
                    <Label htmlFor="duration_weeks" className="text-base font-semibold">Duration (weeks)</Label>
                    <Input
                      id="duration_weeks"
                      type="number"
                      min="4"
                      max="52"
                      value={formData.duration_weeks}
                      onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                      className="mt-2"
                      data-testid="duration-input"
                    />
                    <p className="text-sm text-gray-500 mt-1">Recommended: 8-16 weeks</p>
                  </div>

                  {/* Time per day */}
                  <div>
                    <Label htmlFor="time_per_day" className="text-base font-semibold">Daily Time Commitment</Label>
                    <Select
                      value={formData.time_per_day}
                      onValueChange={(value) => setFormData({ ...formData, time_per_day: value })}
                    >
                      <SelectTrigger className="mt-2" data-testid="time-per-day-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                        <SelectItem value="2-3 hours">2-3 hours</SelectItem>
                        <SelectItem value="3+ hours">3+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Focus Topics */}
                  <div>
                    <Label className="text-base font-semibold">Focus Topics (Optional)</Label>
                    <p className="text-sm text-gray-500 mb-3">Select topics you want to prioritize</p>
                    <div className="flex flex-wrap gap-2">
                      {topicOptions.map((topic) => (
                        <Badge
                          key={topic}
                          variant={formData.focus_topics.includes(topic) ? 'default' : 'outline'}
                          className="cursor-pointer px-4 py-2 text-sm"
                          onClick={() => toggleTopic(topic)}
                          data-testid={`topic-badge-${topic}`}
                        >
                          {topic.replace('-', ' ').toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-lg py-6"
                    disabled={loading}
                    data-testid="generate-roadmap-submit-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Your Personalized Roadmap...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Roadmap
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-fadeIn" data-testid="generated-roadmap">
              {/* Success Message */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="py-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="text-xl font-semibold text-green-900">Roadmap Generated!</h3>
                      <p className="text-green-700">Your personalized learning path is ready</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap Details */}
              <Card className="border-2" data-testid="roadmap-details">
                <CardHeader>
                  <CardTitle className="text-2xl">{generatedRoadmap.title}</CardTitle>
                  <CardDescription className="text-base">{generatedRoadmap.description}</CardDescription>
                  <div className="flex space-x-2 mt-4">
                    <Badge variant="secondary">{generatedRoadmap.skill_level}</Badge>
                    <Badge variant="outline">{generatedRoadmap.duration_weeks} weeks</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Weekly Plan */}
                  {generatedRoadmap.topics?.weekly_plan && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Weekly Breakdown</h3>
                      <div className="space-y-3">
                        {generatedRoadmap.topics.weekly_plan.slice(0, 4).map((week) => (
                          <Card key={week.week} className="border">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">Week {week.week}</h4>
                                <Badge variant="outline">{week.problem_count || 5} problems</Badge>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Topics:</strong> {week.topics?.join(', ') || 'Various topics'}</p>
                                {week.concepts && (
                                  <p><strong>Key Concepts:</strong> {week.concepts.join(', ')}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {generatedRoadmap.topics.weekly_plan.length > 4 && (
                        <p className="text-sm text-gray-500 text-center">
                          ...and {generatedRoadmap.topics.weekly_plan.length - 4} more weeks
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => navigate(`/roadmap/${generatedRoadmap.id}`)}
                  className="flex-1"
                  size="lg"
                  data-testid="view-full-roadmap-btn"
                >
                  View Full Roadmap
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedRoadmap(null);
                    setFormData({
                      skill_level: currentUser?.skill_level || 'beginner',
                      duration_weeks: 12,
                      focus_topics: [],
                      time_per_day: '1-2 hours',
                    });
                  }}
                  variant="outline"
                  size="lg"
                  data-testid="generate-another-btn"
                >
                  Generate Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapGenerator;
