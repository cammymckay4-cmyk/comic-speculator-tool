import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import fixtureData from '../data/fixtures.json';

interface AlertFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AlertForm = ({ initialData, onSubmit, onCancel }: AlertFormProps) => {
  const [selectedSeries, setSelectedSeries] = useState(initialData?.issueId?.split('-').slice(0, -1).join('-') || '');
  const [selectedIssue, setSelectedIssue] = useState(initialData?.issueId || '');
  const [selectedGrade, setSelectedGrade] = useState(initialData?.gradeId || '');
  const [minDealScore, setMinDealScore] = useState([initialData?.minDealScore || 20]);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const availableIssues = selectedSeries 
    ? fixtureData.issues.filter(issue => issue.seriesId === selectedSeries)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedIssue || !selectedGrade) {
      return;
    }

    onSubmit({
      issueId: selectedIssue,
      gradeId: selectedGrade,
      minDealScore: minDealScore[0],
      notes: notes.trim()
    });
  };

  const getIssueDisplay = (issue: any) => {
    const series = fixtureData.series.find(s => s.seriesId === issue.seriesId);
    return `${series?.title} #${issue.issueNumber}`;
  };

  const getGradeDisplay = (grade: any) => {
    return `${grade.scale} ${grade.numeric} (${grade.label})`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Series Selection */}
      <div className="space-y-2">
        <Label htmlFor="series">Comic Series</Label>
        <Select value={selectedSeries} onValueChange={(value) => {
          setSelectedSeries(value);
          setSelectedIssue(''); // Reset issue when series changes
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a comic series" />
          </SelectTrigger>
          <SelectContent>
            {fixtureData.series.map(series => (
              <SelectItem key={series.seriesId} value={series.seriesId}>
                {series.title} ({series.publisher}, {series.startYear})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Issue Selection */}
      <div className="space-y-2">
        <Label htmlFor="issue">Issue Number</Label>
        <Select 
          value={selectedIssue} 
          onValueChange={setSelectedIssue}
          disabled={!selectedSeries}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an issue" />
          </SelectTrigger>
          <SelectContent>
            {availableIssues.map(issue => (
              <SelectItem key={issue.issueId} value={issue.issueId}>
                #{issue.issueNumber} ({issue.coverDate})
                {issue.keyNotes && (
                  <span className="text-xs text-muted-foreground block">
                    {issue.keyNotes}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grade Selection */}
      <div className="space-y-2">
        <Label htmlFor="grade">Grade</Label>
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger>
            <SelectValue placeholder="Select grade condition" />
          </SelectTrigger>
          <SelectContent>
            {fixtureData.grades.map(grade => (
              <SelectItem key={grade.gradeId} value={grade.gradeId}>
                {getGradeDisplay(grade)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Deal Score Threshold */}
      <div className="space-y-4">
        <Label>Minimum Deal Score</Label>
        <div className="space-y-2">
          <Slider
            value={minDealScore}
            onValueChange={setMinDealScore}
            max={50}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>5% off</span>
            <span className="font-medium">
              Alert when deals are {minDealScore[0]}% off or better
            </span>
            <span>50% off</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add notes about why you want this comic..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Preview */}
      {selectedIssue && selectedGrade && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Alert Preview</h4>
          <p className="text-sm text-muted-foreground">
            You'll be notified when <strong>{getIssueDisplay(fixtureData.issues.find(i => i.issueId === selectedIssue))}</strong> in{' '}
            <strong>{getGradeDisplay(fixtureData.grades.find(g => g.gradeId === selectedGrade))}</strong> condition 
            is available for <strong>{minDealScore[0]}% off</strong> market value or better.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={!selectedIssue || !selectedGrade}>
          {initialData ? 'Update Alert' : 'Create Alert'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AlertForm;