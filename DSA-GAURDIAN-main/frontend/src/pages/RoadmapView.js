import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { api } from '../App';
import { toast } from 'sonner';
import { Target, Calendar, Clock, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const RoadmapView = ({ currentUser, logoutUser }) => {
  const navigate = useNavigate();
  const { roadmapId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    fetchRoadmap();
  }, [currentUser, roadmapId, navigate]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/roadmaps/${roadmapId}`);
      setRoadmap(response.data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      toast.error('Failed to load roadmap');
      navigate('/dashboard');
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

  if (!roadmap) return null;

  const weeklyPlan = roadmap.topics?.weekly_plan || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar currentUser={currentUser} logoutUser={logoutUser} />
      
      <div className="container mx-auto px-6 py-8" data-testid="roadmap-view-container">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
          data-testid="back-to-dashboard-btn"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Roadmap Header */}
        <Card className="border-2 mb-8 animate-fadeIn" data-testid="roadmap-header">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="h-10 w-10 text-indigo-600" />
                  <CardTitle className="text-3xl">{roadmap.title}</CardTitle>
                </div>
                <CardDescription className="text-lg mb-4">{roadmap.description}</CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Target className="mr-1 h-4 w-4" />
                    {roadmap.skill_level}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Calendar className="mr-1 h-4 w-4" />
                    {roadmap.duration_weeks} weeks
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Clock className="mr-1 h-4 w-4" />
                    Created {new Date(roadmap.generated_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Weekly Breakdown */}
        <Card data-testid="weekly-breakdown">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              Weekly Learning Plan
            </CardTitle>
            <CardDescription>
              Follow this structured path to master DSA concepts week by week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyPlan.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No weekly plan available for this roadmap</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-3" data-testid="weeks-accordion">
                {weeklyPlan.map((week) => (
                  <AccordionItem key={week.week} value={`week-${week.week}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline" data-testid={`week-trigger-${week.week}`}>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-indigo-100 text-indigo-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                            {week.week}
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-lg">Week {week.week}</div>
                            <div className="text-sm text-gray-500">
                              {week.topics?.length || 0} topics • {week.problem_count || 5} problems
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-6">
                      <div className="space-y-4 pl-14">
                        {/* Topics */}
                        {week.topics && week.topics.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <Target className="mr-2 h-4 w-4 text-indigo-600" />
                              Topics to Cover
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {week.topics.map((topic, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Concepts */}
                        {week.concepts && week.concepts.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Key Concepts to Master
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                              {week.concepts.map((concept, idx) => (
                                <li key={idx}>{concept}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Problem Count */}
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Recommended Problems</span>
                            <Badge variant="outline">{week.problem_count || 5} problems</Badge>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          onClick={() => navigate('/problems')}
                          className="w-full"
                          data-testid={`week-${week.week}-start-btn`}
                        >
                          Start Week {week.week} Problems →
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex space-x-4">
          <Button
            onClick={() => navigate('/problems')}
            size="lg"
            className="flex-1"
            data-testid="browse-problems-btn"
          >
            Browse All Problems
          </Button>
          <Button
            onClick={() => navigate('/generate-roadmap')}
            variant="outline"
            size="lg"
            className="flex-1"
            data-testid="generate-new-roadmap-btn"
          >
            Generate New Roadmap
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
