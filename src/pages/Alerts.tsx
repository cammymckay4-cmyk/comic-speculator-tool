import { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import fixtureData from '../data/fixtures.json';

type NewAlert = {
  id: string;
  seriesId: string;
  issueNumber: string;
  minDealScore: number;
  isActive: boolean;
};

const Alerts = () => {
  const [seriesId, setSeriesId] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [minDealScore, setMinDealScore] = useState<number>(20);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<NewAlert[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!seriesId) {
      errors.seriesId = 'Please select a series';
    }
    
    if (!issueNumber.trim()) {
      errors.issueNumber = 'Please enter an issue number';
    } else if (!/^\d+(\.\d+)?[a-zA-Z]*$/.test(issueNumber.trim())) {
      errors.issueNumber = 'Invalid issue number format (e.g., 300, 300.1, 300a)';
    }
    
    if (minDealScore < 1 || minDealScore > 100) {
      errors.minDealScore = 'Deal score must be between 1 and 100';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
      });
      return;
    }

    // Check for duplicate alerts
    const duplicate = alerts.find(
      (alert) => alert.seriesId === seriesId && alert.issueNumber.toLowerCase() === issueNumber.trim().toLowerCase()
    );
    
    if (duplicate) {
      toast({
        variant: "warning",
        title: "Duplicate Alert",
        description: "An alert for this comic already exists.",
      });
      return;
    }

    const series = fixtureData.series.find(s => s.seriesId === seriesId);
    const newAlert: NewAlert = {
      id: `alert-${Date.now()}`,
      seriesId,
      issueNumber: issueNumber.trim(),
      minDealScore,
      isActive,
    };
    
    setAlerts((prev) => [newAlert, ...prev]);
    setSeriesId('');
    setIssueNumber('');
    setMinDealScore(20);
    setIsActive(true);
    setFormErrors({});
    
    toast({
      variant: "success",
      title: "Alert Created",
      description: `Successfully created alert for ${series?.title} #${issueNumber.trim()}`,
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    const alertToDelete = alerts.find(a => a.id === alertId);
    const series = fixtureData.series.find(s => s.seriesId === alertToDelete?.seriesId);
    
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    
    toast({
      variant: "success",
      title: "Alert Deleted",
      description: `Alert for ${series?.title} #${alertToDelete?.issueNumber} has been deleted`,
    });
  };

  const toggleAlertStatus = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
    
    const updatedAlert = alerts.find(a => a.id === alertId);
    const series = fixtureData.series.find(s => s.seriesId === updatedAlert?.seriesId);
    
    toast({
      variant: "info",
      title: "Alert Updated",
      description: `Alert for ${series?.title} #${updatedAlert?.issueNumber} has been ${updatedAlert?.isActive ? 'paused' : 'activated'}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
            <p className="text-muted-foreground">Create simple deal alerts from fixtures.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="series">Series</Label>
                    <select
                      id="series"
                      className={`w-full border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring ${
                        formErrors.seriesId ? 'border-destructive' : ''
                      }`}
                      value={seriesId}
                      onChange={(e) => setSeriesId(e.target.value)}
                      aria-required="true"
                      aria-invalid={!!formErrors.seriesId}
                      aria-describedby={formErrors.seriesId ? "series-error" : undefined}
                    >
                      <option value="" disabled>Select a series</option>
                      {fixtureData.series.map((s) => (
                        <option key={s.seriesId} value={s.seriesId}>
                          {s.title} ({s.publisher}, {s.startYear})
                        </option>
                      ))}
                    </select>
                    {formErrors.seriesId && (
                      <p id="series-error" className="text-sm text-destructive" role="alert">
                        {formErrors.seriesId}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issueNumber">Issue Number</Label>
                    <Input
                      id="issueNumber"
                      placeholder="#1"
                      value={issueNumber}
                      onChange={(e) => setIssueNumber(e.target.value)}
                      aria-required="true"
                      aria-invalid={!!formErrors.issueNumber}
                      aria-describedby={formErrors.issueNumber ? "issue-error" : undefined}
                      className={formErrors.issueNumber ? 'border-destructive' : ''}
                    />
                    {formErrors.issueNumber && (
                      <p id="issue-error" className="text-sm text-destructive" role="alert">
                        {formErrors.issueNumber}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minDealScore">Min Deal Score (%)</Label>
                    <Input
                      id="minDealScore"
                      type="number"
                      step={1}
                      value={minDealScore}
                      onChange={(e) => setMinDealScore(Number(e.target.value))}
                      aria-invalid={!!formErrors.minDealScore}
                      aria-describedby={formErrors.minDealScore ? "score-error" : undefined}
                      className={formErrors.minDealScore ? 'border-destructive' : ''}
                    />
                    {formErrors.minDealScore && (
                      <p id="score-error" className="text-sm text-destructive" role="alert">
                        {formErrors.minDealScore}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit">Add Alert</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Alerts</CardTitle>
              {alerts.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {alerts.filter(a => a.isActive).length} active, {alerts.filter(a => !a.isActive).length} paused
                </p>
              )}
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <Alert>
                  <AlertTitle>No alerts yet</AlertTitle>
                  <AlertDescription>
                    Create your first alert using the form above to get notified of great comic deals.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a) => {
                    const series = fixtureData.series.find((s) => s.seriesId === a.seriesId);
                    return (
                      <div key={a.id} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                {series?.title} #{a.issueNumber}
                              </div>
                              {a.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <CheckCircle className="w-3 h-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                  <XCircle className="w-3 h-3" />
                                  Paused
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Notify when deals are {a.minDealScore}% off or better
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAlertStatus(a.id)}
                              aria-label={a.isActive ? 'Pause alert' : 'Activate alert'}
                            >
                              {a.isActive ? 'Pause' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAlert(a.id)}
                              aria-label="Delete alert"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Alerts;