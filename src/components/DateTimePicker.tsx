'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: string;
  onChange: (isoString: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({ 
  value, 
  onChange, 
  placeholder = "Select date and time",
  disabled = false 
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [timeValue, setTimeValue] = useState<string>(
    value ? format(new Date(value), 'HH:mm') : ''
  );

  const handleDateChange = (date: string) => {
    const newDate = new Date(date);
    setSelectedDate(newDate);
    
    // If time is already selected, combine them
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const combinedDateTime = new Date(newDate);
      combinedDateTime.setHours(hours, minutes, 0, 0);
      onChange(combinedDateTime.toISOString());
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    
    // If date is already selected, combine them
    if (selectedDate && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(hours, minutes, 0, 0);
      onChange(combinedDateTime.toISOString());
    }
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    setTimeValue('');
    onChange('');
  };

  const displayValue = selectedDate && timeValue 
    ? `${format(selectedDate, 'PPP')} at ${timeValue}`
    : placeholder;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Schedule Date & Time</CardTitle>
        <CardDescription>
          Select when you want to send the campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={disabled}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        <div className="space-y-2">
          <Label>Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>
        </div>

        {selectedDate && timeValue && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Selected:</p>
              <p className="text-sm text-muted-foreground">{displayValue}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
            >
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
