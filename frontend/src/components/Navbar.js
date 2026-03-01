import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Code, LayoutDashboard, Sparkles, BookOpen, LogOut, User } from 'lucide-react';

const Navbar = ({ currentUser, logoutUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50" data-testid="navbar">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')} data-testid="nav-logo">
            <Code className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold gradient-text">DSA Forge</span>
          </div>

          {/* Navigation Links */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} data-testid="nav-dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate('/generate-roadmap')} data-testid="nav-generate-roadmap">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Roadmap
              </Button>
              <Button variant="ghost" onClick={() => navigate('/problems')} data-testid="nav-problems">
                <BookOpen className="mr-2 h-4 w-4" />
                Problems
              </Button>
            </div>
          )}

          {/* User Menu */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="nav-user-menu">
                  <Avatar>
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/generate-roadmap')} data-testid="menu-generate-roadmap">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Roadmap
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/problems')} data-testid="menu-problems">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Problems
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;