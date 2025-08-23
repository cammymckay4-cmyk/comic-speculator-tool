import { useState } from 'react';
import Navigation from '../components/Navigation';
import AlertForm from '../components/AlertForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Bell, Trash2, Edit } from 'lucide-react';
import fixtureData from '../data/fixtures.json';

const Alerts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [alerts, setAlerts] = useState(fixtureData.alertRules);

  const handleCreateAlert = (alertData: any) => {
    const newAlert = {
      alertRuleId: `alert-${Date.now()}`,
      userId: "user-collector-uk-001",
      ...alertData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAlerts([...alerts, newAlert]);
    setShowForm(false);
  };

  const handleEditAlert = (alertData: any) => {
    setAlerts(alerts.map(alert => 
      alert.alertRuleId === editingAlert 
        ? { ...alert, ...alertData, updatedAt: new Date().toISOString() }
        : alert
    ));
    setEditingAlert(null);
    setShowForm(false);
  };

  const toggleAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.alertRuleId === alertId 
        ? { ...alert, isActive: !alert.isActive, updatedAt: new Date().toISOString() }
        : alert
    ));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.alertRuleId !== alertId));
  };

  const getAlertDisplay = (alert: any) => {
    const issue = fixtureData.issues.find(i => i.issueId === alert.issueId);
    const series = issue ? fixtureData.series.find(s => s.seriesId === issue.seriesId) : null;
    const grade = fixtureData.grades.find(g => g.gradeId === alert.gradeId);
    
    return {
      title: series ? `${series.title} #${issue?.issueNumber}` : 'Unknown Comic',
      grade: grade ? `${grade.scale} ${grade.numeric}` : 'Unknown Grade',
      publisher: series?.publisher || 'Unknown Publisher'
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Deal Alerts</h1>
              <p className="text-muted-foreground mt-1">
                Get notified when your target comics hit your price points
              </p>
            </div>
            
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Alert
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alerts.filter(a => a.isActive).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Deals Triggered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">0</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Alert Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingAlert ? 'Edit Alert' : 'Create New Alert'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertForm
                  initialData={editingAlert ? alerts.find(a => a.alertRuleId === editingAlert) : null}
                  onSubmit={editingAlert ? handleEditAlert : handleCreateAlert}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingAlert(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Alerts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Your Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No alerts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first alert to get notified of great deals
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map(alert => {
                    const display = getAlertDisplay(alert);
                    
                    return (
                      <div 
                        key={alert.alertRuleId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{display.title}</h3>
                            <Badge variant="outline">{display.grade}</Badge>
                            {alert.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Paused</Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <span>{display.publisher}</span>
                            <span className="mx-2">•</span>
                            <span>Alert when deal ≥ {alert.minDealScore}% off</span>
                          </div>
                          
                          {alert.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              "{alert.notes}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={() => toggleAlert(alert.alertRuleId)}
                          />
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAlert(alert.alertRuleId);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAlert(alert.alertRuleId)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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