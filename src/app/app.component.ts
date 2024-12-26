import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  BsDatepickerDirective,
  BsDatepickerConfig,
  DatepickerDateCustomClasses,
  BsLocaleService,
} from 'ngx-bootstrap/datepicker';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(BsDatepickerDirective, { static: false })
  datepickerRef: BsDatepickerDirective;

  myForm: FormGroup;
  selectedDates: Date[] = [];
  dateCustomClasses: DatepickerDateCustomClasses[] = [];
  isCalendarOpen = false;

  bsConfig: Partial<BsDatepickerConfig> = {
    containerClass: 'theme-green',
    showWeekNumbers: false,
    adaptivePosition: true,
    isAnimated: false,
    selectFromOtherMonth: true,
  };

  constructor(
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private renderer: Renderer2,
    private bsLocaleService: BsLocaleService
  ) {
    this.bsLocaleService.use('pt-br');
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      date: null,
    });
  }

  ngAfterViewInit() {
    if (this.datepickerRef) {
      this.preventCalendarAutoClose();
    }
  }
  onDateSelect(selectedDate: Date) {
    if (selectedDate) {
      const normalizedDate = this.normalizeDate(selectedDate);
      const index = this.selectedDates.findIndex(
        (date) =>
          this.normalizeDate(date).getTime() === normalizedDate.getTime()
      );

      if (index === -1) {
        this.selectedDates.push(normalizedDate);
      } else {
        this.selectedDates.splice(index, 1);
      }

      this.updateDateCustomClasses();

      // Limpa o valor do FormControl para evitar destacar a última data selecionada
      this.myForm.get('date')?.setValue(null);

      this.clearInputField(); // Garante que o campo de input é limpo
      this.keepCalendarOpen(); // Mantém o calendário aberto
    }
  }

  normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  updateDateCustomClasses() {
    this.dateCustomClasses = this.selectedDates.map((date) => ({
      date,
      classes: ['highlight-selected'],
    }));
  }

  // Limpa o campo de input sem interferir no funcionamento do FormControl
  clearInputField() {
    const inputElement = document.querySelector(
      'input[formcontrolname="date"]'
    ) as HTMLInputElement;

    if (inputElement) {
      inputElement.value = ''; // Limpa o valor exibido no input diretamente
    }
  }

  keepCalendarOpen() {
    if (this.datepickerRef) {
      setTimeout(() => this.datepickerRef.show(), 0);
    }
  }

  preventCalendarAutoClose() {
    const calendarContainer = document.querySelector('.bs-datepicker');
    if (calendarContainer) {
      calendarContainer.addEventListener('click', (event: MouseEvent) => {
        event.stopPropagation();
      });
    }
  }
  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const clickedInside = this.el.nativeElement.contains(targetElement);

    if (!clickedInside) {
      this.isCalendarOpen = false;
      if (this.datepickerRef) {
        this.datepickerRef.hide();
      }
    }
  }
}
