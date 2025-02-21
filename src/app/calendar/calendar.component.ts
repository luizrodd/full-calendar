import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';


interface Event {
  id: number;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: 'personal' | 'work' | 'holiday';
}

type ViewType = 'month' | 'week' | 'day';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  weekDays = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
  hours = Array.from({ length: 24 }, (_, i) => i);
  calendarDays: Array<{ date: Date; otherMonth: boolean }> = [];
  weekDates: Date[] = [];
  view: ViewType = 'month';

  events: Event[] = [
    {
      id: 1,
      title: 'Reunião de Equipe',
      date: new Date(),
      startTime: '10:00',
      endTime: '11:30',
      type: 'work'
    },
    {
      id: 2,
      title: 'Almoço com Cliente',
      date: new Date(),
      startTime: '12:00',
      endTime: '13:30',
      type: 'work'
    },
    {
      id: 3,
      title: 'Academia',
      date: new Date(),
      startTime: '18:00',
      endTime: '19:00',
      type: 'personal'
    },
    {
      id: 4,
      title: 'Carnaval',
      date: new Date(),
      type: 'holiday'
    }
  ];

  ngOnInit() {
    this.generateCalendarDays();
    this.generateWeekDates();
  }

  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonthDays = new Date(year, month, 0).getDate();

    this.calendarDays = [];

    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        otherMonth: true
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.calendarDays.push({
        date: new Date(year, month, i),
        otherMonth: false
      });
    }

    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: new Date(year, month + 1, i),
        otherMonth: true
      });
    }
  }

  generateWeekDates() {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    this.weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }

  getCurrentDateDisplay(): string {
    if (this.view === 'month') {
      return this.currentDate.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });
    } else if (this.view === 'week') {
      const firstDay = this.weekDates[0];
      const lastDay = this.weekDates[6];
      return `${firstDay.getDate()} - ${lastDay.getDate()} de ${firstDay.toLocaleDateString('pt-BR', { month: 'long' })} de ${firstDay.getFullYear()}`;
    } else {
      return this.currentDate.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }

  previous() {
    if (this.view === 'month') {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      );
      this.generateCalendarDays();
    } else if (this.view === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
      this.generateWeekDates();
    } else {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
  }

  next() {
    if (this.view === 'month') {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      );
      this.generateCalendarDays();
    } else if (this.view === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
      this.generateWeekDates();
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    }
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateCalendarDays();
    this.generateWeekDates();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  getEventsForDate(date: Date): Event[] {
    return this.events.filter(event =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  }

  getEventsForDateTime(date: Date, hour: number): Event[] {
    const eventsForDateTime = this.events.filter(event => {
      if (!event.startTime) return false;

      const eventDate = event.date;
      const eventHour = parseInt(event.startTime.split(':')[0]);

      return eventDate.getDate() === date.getDate() &&
         eventDate.getMonth() === date.getMonth() &&
         eventDate.getFullYear() === date.getFullYear() &&
         eventHour === hour;
    });

    return eventsForDateTime;
  }

  getEventTop(event: Event): number {
    if (!event.startTime) return 0;
    const [hours, minutes] = event.startTime.split(':').map(Number);
    return (minutes / 60) * 60;
  }

  getEventHeight(event: Event): number {
    if (!event.startTime || !event.endTime) return 20;

    const [startHours, startMinutes] = event.startTime.split(':').map(Number);
    const [endHours, endMinutes] = event.endTime.split(':').map(Number);

    const durationInMinutes = (endHours - startHours) * 60 + (endMinutes - startMinutes);
    return (durationInMinutes / 60) * 60;
  }

  changeView(newView: string) {
    this.view = newView as ViewType;
  }

  getViewName(view: string): string {
    const names = {
      month: 'Mês',
      week: 'Semana',
      day: 'Dia'
    };
    return names[view as keyof typeof names];
  }
}
