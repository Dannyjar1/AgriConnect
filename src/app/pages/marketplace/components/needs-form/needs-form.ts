import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-needs-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './needs-form.html',
  styleUrl: './needs-form.scss'
})
export class NeedsFormComponent {
  private fb = inject(FormBuilder);

  needsForm = this.fb.group({
    productType: ['', Validators.required],
    quantity: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    characteristics: [''],
    certifications: [''],
    location: ['']
  });

  onSubmit() {
    if (this.needsForm.valid) {
      console.log('Formulario enviado!', this.needsForm.value);
      // Aquí se enviaría el formulario al servicio de asignación
    }
  }
}