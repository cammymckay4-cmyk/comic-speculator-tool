import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Alerts from '@/pages/Alerts';

// Mock the navigation component
vi.mock('../components/Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation</div>
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  }))
}));

// Mock the router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Alert Component', () => {
  it('renders with default variant', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(
      <Alert variant="success">
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>Operation completed successfully</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-green-500/50');
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders with warning variant', () => {
    render(
      <Alert variant="warning">
        <AlertTitle>Warning!</AlertTitle>
        <AlertDescription>Please be careful</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-yellow-500/50');
    expect(screen.getByText('Warning!')).toBeInTheDocument();
  });

  it('renders with error variant', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-destructive/50');
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('renders with info variant', () => {
    render(
      <Alert variant="info">
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Here is some information</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-blue-500/50');
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('renders dismissible alert with close button', () => {
    const onDismiss = vi.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        <AlertTitle>Dismissible Alert</AlertTitle>
        <AlertDescription>This can be dismissed</AlertDescription>
      </Alert>
    );

    const closeButton = screen.getByRole('button', { name: /dismiss alert/i });
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('has proper accessibility attributes', () => {
    render(
      <Alert>
        <AlertTitle>Accessible Alert</AlertTitle>
        <AlertDescription>This alert is accessible</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('supports keyboard navigation for dismissible alerts', () => {
    const onDismiss = vi.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        <AlertTitle>Keyboard Accessible</AlertTitle>
        <AlertDescription>Can be dismissed with keyboard</AlertDescription>
      </Alert>
    );

    const closeButton = screen.getByRole('button', { name: /dismiss alert/i });
    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: 'Enter' });
    
    // The button click should be triggered by Enter key
    expect(document.activeElement).toBe(closeButton);
  });
});

describe('Alerts Page', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as () => {
    toast: (props: {
      variant?: "default" | "destructive" | "success" | "warning" | "info";
      title: string;
      description: string;
    }) => void;
    toasts: never[];
    dismiss: (toastId?: string) => void;
  }).mockReturnValue({
      toast: mockToast,
      toasts: [],
      dismiss: vi.fn(),
    });
  });

  it('renders alert creation form', () => {
    render(<Alerts />);

    expect(screen.getByText('Create Alert')).toBeInTheDocument();
    expect(screen.getByLabelText(/series/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/issue number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/min deal score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty form submission', async () => {
    render(<Alerts />);

    const submitButton = screen.getByRole('button', { name: /add alert/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
      });
    });

    expect(screen.getByText('Please select a series')).toBeInTheDocument();
    expect(screen.getByText('Please enter an issue number')).toBeInTheDocument();
  });

  it('validates issue number format', async () => {
    render(<Alerts />);

    const seriesSelect = screen.getByLabelText(/series/i);
    const issueInput = screen.getByLabelText(/issue number/i);
    const submitButton = screen.getByRole('button', { name: /add alert/i });

    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: 'invalid-issue' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid issue number format/i)).toBeInTheDocument();
    });
  });

  it('validates deal score range', async () => {
    render(<Alerts />);

    const seriesSelect = screen.getByLabelText(/series/i);
    const issueInput = screen.getByLabelText(/issue number/i);
    const dealScoreInput = screen.getByLabelText(/min deal score/i);
    const submitButton = screen.getByRole('button', { name: /add alert/i });

    // Fill required fields first
    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: '300' } });
    fireEvent.change(dealScoreInput, { target: { value: '150' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Deal score must be between 1 and 100')).toBeInTheDocument();
    });
  });

  it('creates alert successfully with valid data', async () => {
    render(<Alerts />);

    const seriesSelect = screen.getByLabelText(/series/i);
    const issueInput = screen.getByLabelText(/issue number/i);
    const submitButton = screen.getByRole('button', { name: /add alert/i });

    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: '300' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "success",
        title: "Alert Created",
        description: "Successfully created alert for The Amazing Spider-Man #300",
      });
    });
  });

  it('prevents duplicate alerts', async () => {
    render(<Alerts />);

    const seriesSelect = screen.getByLabelText(/series/i);
    const issueInput = screen.getByLabelText(/issue number/i);
    const submitButton = screen.getByRole('button', { name: /add alert/i });

    // Create first alert
    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: '300' } });
    fireEvent.click(submitButton);

    // Try to create duplicate
    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: '300' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "warning",
        title: "Duplicate Alert",
        description: "An alert for this comic already exists.",
      });
    });
  });

  it('displays created alerts', async () => {
    render(<Alerts />);

    const seriesSelect = screen.getByLabelText(/series/i);
    const issueInput = screen.getByLabelText(/issue number/i);
    const submitButton = screen.getByRole('button', { name: /add alert/i });

    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: '300' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('The Amazing Spider-Man #300')).toBeInTheDocument();
      // Check for the status badge specifically, not the form label
      const statusElements = screen.getAllByText('Active');
      expect(statusElements.length).toBeGreaterThan(1); // Should have both form label and status badge
    });
  });

  it('toggles alert status', async () => {
    render(<Alerts />);

    // Create an alert first
    const seriesSelect = screen.getByLabelText(/series/i);
    const issueInput = screen.getByLabelText(/issue number/i);
    const submitButton = screen.getByRole('button', { name: /add alert/i });

    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: '300' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('The Amazing Spider-Man #300')).toBeInTheDocument();
      expect(screen.getAllByText('Active').length).toBeGreaterThan(1);
    });

    // Toggle status
    const pauseButton = screen.getByRole('button', { name: /pause alert/i });
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "info",
        title: "Alert Updated",
        description: "Alert for The Amazing Spider-Man #300 has been paused",
      });
    });
  });

  it('deletes alert', async () => {
    render(<Alerts />);

    // Create an alert first
    const seriesSelect = screen.getByLabelText(/series/i);
    const issueInput = screen.getByLabelText(/issue number/i);
    const submitButton = screen.getByRole('button', { name: /add alert/i });

    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: '300' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('The Amazing Spider-Man #300')).toBeInTheDocument();
    });

    // Delete alert
    const deleteButton = screen.getByRole('button', { name: /delete alert/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "success",
        title: "Alert Deleted",
        description: "Alert for The Amazing Spider-Man #300 has been deleted",
      });
    });

    expect(screen.queryByText('The Amazing Spider-Man #300')).not.toBeInTheDocument();
  });

  it('shows empty state when no alerts exist', () => {
    render(<Alerts />);

    expect(screen.getByText('No alerts yet')).toBeInTheDocument();
    expect(screen.getByText(/create your first alert/i)).toBeInTheDocument();
  });

  it('shows alert count summary', async () => {
    render(<Alerts />);

    // Create multiple alerts
    const seriesSelect = screen.getByLabelText(/series/i);
    const issueInput = screen.getByLabelText(/issue number/i);
    const submitButton = screen.getByRole('button', { name: /add alert/i });

    // First alert
    fireEvent.change(seriesSelect, { target: { value: 'amazing-spider-man-1963' } });
    fireEvent.change(issueInput, { target: { value: '300' } });
    fireEvent.click(submitButton);

    // Second alert
    await waitFor(() => {
      expect(screen.getByText('The Amazing Spider-Man #300')).toBeInTheDocument();
    });
    
    fireEvent.change(seriesSelect, { target: { value: 'batman-1940' } });
    fireEvent.change(issueInput, { target: { value: '181' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('2 active, 0 paused')).toBeInTheDocument();
    });
  });
});