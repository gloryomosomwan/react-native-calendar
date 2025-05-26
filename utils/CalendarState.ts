import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, isSameDay, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';

export type ViewMode = 'month' | 'week';
export type DateRange = { start: Date; end: Date };

export class CalendarState {
  private _currentDate: Date;
  // private _viewMode: ViewMode;
  // private _displayedPeriod: DateRange;
  private _subscribers: Set<() => void>;
  private _daySubscribers: Set<() => void>;
  private _todayDate: Date;
  private _dateOfDisplayedMonth: Date;
  private _previousDate: Date
  private _dayPressed: boolean = false

  constructor(initialDate: Date = new Date()) {
    this._todayDate = new Date(new Date().toISOString());
    this._currentDate = initialDate;
    this._previousDate = initialDate
    // this._viewMode = 'month';
    // this._displayedPeriod = this.calculateRange(initialDate);
    this._subscribers = new Set();
    this._daySubscribers = new Set();
    this._dateOfDisplayedMonth = initialDate
  }

  daySelectDate(date: Date) {
    this._currentDate = date
    this.notifyDaySubscribers()
  }

  // Calculate the visible range based on current mode and date
  // private calculateRange(date: Date): DateRange {
  //   if (this._viewMode === 'month') {
  //     return {
  //       start: startOfMonth(date),
  //       end: endOfMonth(date)
  //     };
  //   } else {
  //     return {
  //       start: startOfWeek(date),
  //       end: endOfWeek(date)
  //     };
  //   }
  // }

  // Select a specific date
  selectDate(date: Date, fromDayPress: boolean = false) {
    if (fromDayPress) {
      this._dayPressed = true
      setTimeout(() => {
        this._dayPressed = false
      }, 300)
    }
    // if (isSameDay(this._currentDate, date)) return;
    this._currentDate = date;
    // this._displayedPeriod = this.calculateRange(date);
    this.notifySubscribers();
  }

  selectPreviousDate(date: Date) {
    this._previousDate = date
    // this.notifySubscribers();
  }

  setDayOfDisplayedMonth(date: Date) {
    if (isSameDay(this._dateOfDisplayedMonth, date)) return;

    this._dateOfDisplayedMonth = date
  }

  // Navigate to next period (month/week)
  // next() {
  //   const newDate = this._viewMode === 'month'
  //     ? addMonths(this._currentDate, 1)
  //     : addWeeks(this._currentDate, 1);

  //   this._currentDate = newDate;
  //   this._displayedPeriod = this.calculateRange(newDate);
  //   this.notifySubscribers();
  // }

  // Navigate to previous period (month/week)
  // previous() {
  //   const newDate = this._viewMode === 'month'
  //     ? subMonths(this._currentDate, 1)
  //     : subWeeks(this._currentDate, 1);

  //   this._currentDate = newDate;
  //   this._displayedPeriod = this.calculateRange(newDate);
  //   this.notifySubscribers();
  // }

  // Navigate to today
  // today() {
  //   this._currentDate = this._todayDate;
  //   this._displayedPeriod = this.calculateRange(this._todayDate);
  //   this.notifySubscribers();
  // }

  // Switch between month and week view
  // setViewMode(mode: ViewMode) {
  //   if (this._viewMode === mode) return;

  //   this._viewMode = mode;
  //   this._displayedPeriod = this.calculateRange(this._currentDate);
  //   this.notifySubscribers();
  // }

  // Get days for current month with padding for full weeks
  // getMonthDays(): Date[] {
  //   const days: Date[] = [];
  //   const monthStart = startOfMonth(this._currentDate);
  //   const monthEnd = endOfMonth(this._currentDate);

  //   // Add days from previous month to fill the first week
  //   const weekStart = startOfWeek(monthStart);
  //   let day = weekStart;

  //   while (day < monthEnd) {
  //     days.push(day);
  //     day = addDays(day, 1);
  //   }

  //   // Add days to complete the last week
  //   const lastWeekEnd = endOfWeek(monthEnd);
  //   while (day <= lastWeekEnd) {
  //     days.push(day);
  //     day = addDays(day, 1);
  //   }

  //   return days;
  // }

  // Get days for current week
  // getWeekDays(): Date[] {
  //   const days: Date[] = [];
  //   const weekStart = startOfWeek(this._currentDate);

  //   for (let i = 0; i < 7; i++) {
  //     days.push(addDays(weekStart, i));
  //   }

  //   return days;
  // }

  // Generate a 3-item array for paged view
  // getMonthItems(): { id: string; initialDay: Date }[] {
  //   return [
  //     { id: String(Date.now() + 1), initialDay: startOfMonth(subMonths(this._currentDate, 1)) },
  //     { id: String(Date.now() + 2), initialDay: startOfMonth(this._currentDate) },
  //     { id: String(Date.now() + 3), initialDay: startOfMonth(addMonths(this._currentDate, 1)) }
  //   ];
  // }

  // Generate a 3-item array for paged week view
  // getWeekItems(): { id: string; initialDay: Date }[] {
  //   return [
  //     { id: String(Date.now() + 1), initialDay: startOfWeek(subWeeks(this._currentDate, 1)) },
  //     { id: String(Date.now() + 2), initialDay: startOfWeek(this._currentDate) },
  //     { id: String(Date.now() + 3), initialDay: startOfWeek(addWeeks(this._currentDate, 1)) }
  //   ];
  // }

  // Subscribe to changes
  subscribe(callback: () => void): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  daySubscribe(callback: () => void): () => void {
    this._daySubscribers.add(callback);
    return () => {
      this._daySubscribers.delete(callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers() {
    this._subscribers.forEach(callback => callback());
  }

  private notifyDaySubscribers() {
    this._daySubscribers.forEach(callback => callback());
  }

  // Getters
  get currentDate() { return this._currentDate; }
  get previousDate() { return this._previousDate }
  get dateOfDisplayedMonth() { return this._dateOfDisplayedMonth }
  // get viewMode() { return this._viewMode; }
  // get displayedPeriod() { return this._displayedPeriod; }
  get todayDate() { return this._todayDate; }
  get dayPressed() { return this._dayPressed }
}