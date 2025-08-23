import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Bell, Search } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">ComicScout</span>
            <Badge variant="outline" className="text-xs">
              UK
            </Badge>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/">
              <Button 
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
              >
                Top Deals
              </Button>
            </Link>
            
            <Link to="/alerts">
              <Button 
                variant={isActive('/alerts') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Alerts
              </Button>
            </Link>
          </div>
          
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Search className="w-4 h-4 mr-2" />
              Search Comics
            </Button>
            
            {/* Mobile menu */}
            <div className="md:hidden flex items-center space-x-2">
              <Link to="/">
                <Button 
                  variant={isActive('/') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Deals
                </Button>
              </Link>
              <Link to="/alerts">
                <Button 
                  variant={isActive('/alerts') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;