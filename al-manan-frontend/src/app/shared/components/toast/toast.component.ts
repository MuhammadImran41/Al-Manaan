import { Component } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  toasts$;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: string): void {
    this.toastService.remove(id);
  }

  trackById(_: number, toast: Toast): string {
    return toast.id;
  }
}
