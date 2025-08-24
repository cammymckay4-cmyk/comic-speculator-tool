import { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesId || !issueNumber) return;
    const newAlert: NewAlert = {
      id: `alert-${Date.now()}`,
      seriesId,
      issueNumber: issueNumber.trim(),
      minDealScore,
      isActive,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setIssueNumber('');
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
                      className="w-full border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                      value={seriesId}
                      onChange={(e) => setSeriesId(e.target.value)}
                      aria-required="true"
                    >
                      <option value="" disabled>Select a series</option>
                      {fixtureData.series.map((s) => (
                        <option key={s.seriesId} value={s.seriesId}>
                          {s.title} ({s.publisher}, {s.startYear})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issueNumber">Issue Number</Label>
                    <Input
                      id="issueNumber"
                      placeholder="#1"
                      value={issueNumber}
                      onChange={(e) => setIssueNumber(e.target.value)}
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minDealScore">Min Deal Score (%)</Label>
                    <Input
                      id="minDealScore"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={minDealScore}
                      onChange={(e) => setMinDealScore(Number(e.target.value))}
                    />
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
                  <Button type="submit" disabled={!seriesId || !issueNumber}>Add Alert</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No alerts yet. Create one above.</p>
              ) : (
                <ul className="space-y-3">
                  {alerts.map((a) => {
                    const series = fixtureData.series.find((s) => s.seriesId === a.seriesId);
                    return (
                      <li key={a.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {series?.title} #{a.issueNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Min deal score: {a.minDealScore}%
                            </div>
                          </div>
                          <div className="text-xs">
                            {a.isActive ? (
                              <span className="px-2 py-1 rounded bg-primary text-primary-foreground">Active</span>
                            ) : (
                              <span className="px-2 py-1 rounded bg-muted text-foreground">Paused</span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Alerts;