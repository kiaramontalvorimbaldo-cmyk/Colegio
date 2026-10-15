import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { ChartComponent } from '../../../shared/components/chart/chart';

interface ResumenEconomico {  parametros: { pension_mensual: number; num_estudiantes: number; gastos_operativos: number; meses: number };
  teorica: number;
  efectiva: number;
  pendiente: number;
  morosidad_pct: number;
  planilla: number;
  gastos_operativos: number;
  balance_neto: number;
  punto_equilibrio: number;
  supera_equilibrio: boolean;
  por_mes: { mes: string; efectiva: number; pendiente: number }[];
}

/** Panel económico: fórmulas del proyecto, parámetros editables y gráficos. */
@Component({
  selector: 'app-economia',
  imports: [ReactiveFormsModule, DecimalPipe, ChartComponent, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (datos(); as d) {
      <div class="indicadores">
        <mat-card class="indicador">
          <mat-icon aria-hidden="true">payments</mat-icon>
          <div><strong>{{ d.teorica | number:'1.2-2' }}</strong><span>Recaudación teórica (S/)</span></div>
        </mat-card>
        <mat-card class="indicador">
          <mat-icon aria-hidden="true">check_circle</mat-icon>
          <div><strong>{{ d.efectiva | number:'1.2-2' }}</strong><span>Recaudación efectiva (S/)</span></div>
        </mat-card>
        <mat-card class="indicador">
          <mat-icon aria-hidden="true">report</mat-icon>
          <div><strong>{{ d.morosidad_pct }}%</strong><span>Morosidad</span></div>
        </mat-card>
        <mat-card class="indicador">
          <mat-icon aria-hidden="true">account_balance</mat-icon>
          <div><strong>{{ d.balance_neto | number:'1.2-2' }}</strong><span>Balance neto (S/)</span></div>
        </mat-card>
      </div>

      <div class="graficos">
        <mat-card>
          <mat-card-header><mat-card-title>Recaudación por mes</mat-card-title>
            <mat-card-subtitle>Cobrado frente a pendiente</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-chart
              tipo="bar"
              [etiquetas]="etiquetasMes()"
              [datos]="efectivaMes()"
              titulo="Cobrado"
              etiquetaAccesible="Recaudación cobrada por mes"
            />
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Composición de la recaudación</mat-card-title>
            <mat-card-subtitle>Efectiva y pendiente del periodo</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-chart
              tipo="doughnut"
              [etiquetas]="['Efectiva', 'Pendiente']"
              [datos]="[d.efectiva, d.pendiente]"
              [colores]="['#16a34a', '#dc2626']"
              titulo="Recaudación"
              etiquetaAccesible="Composición de la recaudación"
            />
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Punto de equilibrio</mat-card-title>
            <mat-card-subtitle>{{ d.supera_equilibrio ? 'La institución supera el punto de equilibrio' : 'La institución aún no alcanza el punto de equilibrio' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-chart
              tipo="bar"
              [etiquetas]="['Estudiantes actuales', 'Punto de equilibrio']"
              [datos]="[d.parametros.num_estudiantes, d.punto_equilibrio]"
              titulo="Estudiantes"
              etiquetaAccesible="Estudiantes actuales frente al punto de equilibrio"
            />
            <p class="formula">
              (planilla {{ d.planilla | number:'1.2-2' }} + gastos {{ d.gastos_operativos | number:'1.2-2' }})
              ÷ pensión {{ d.parametros.pension_mensual | number:'1.2-2' }} =
              <strong>{{ d.punto_equilibrio }} estudiantes</strong>
            </p>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="parametros">
        <mat-card-header><mat-card-title>Parámetros económicos</mat-card-title>
          <mat-card-subtitle>Al guardar se recalculan los indicadores y los gráficos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="guardar()" class="fila">
            <mat-form-field appearance="outline">
              <mat-label>Pensión mensual (S/)</mat-label>
              <input matInput type="number" min="1" step="0.01" formControlName="pension_mensual" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Número de estudiantes</mat-label>
              <input matInput type="number" min="0" step="1" formControlName="num_estudiantes" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Gastos operativos (S/)</mat-label>
              <input matInput type="number" min="0" step="0.01" formControlName="gastos_operativos" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Meses del periodo</mat-label>
              <input matInput type="number" min="1" max="12" step="1" formControlName="meses" />
              @if (formulario.controls.meses.hasError('min') || formulario.controls.meses.hasError('max')) {
                <mat-error>Entre 1 y 12 meses</mat-error>
              }
            </mat-form-field>
            <button mat-flat-button type="submit" [disabled]="guardando()" class="guardar">
              {{ guardando() ? 'Guardando...' : 'Actualizar parámetros' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    } @else {
      <p>Cargando indicadores económicos...</p>
    }
  `,
  styles: `
    .indicadores { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    .indicador { display: flex; align-items: center; gap: 14px; padding: 14px; }
    .indicador mat-icon {
      width: 46px; height: 46px; font-size: 46px; line-height: 46px; text-align: center;
      display: grid; place-items: center; border-radius: 10px; color: #2c4f86;
      background: #eef3fb; flex: 0 0 46px;
    }
    .indicador strong { display: block; font-size: 1.3rem; color: #16305c; }
    .indicador span { font-size: 0.76rem; color: #6b7280; }
    .graficos { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-top: 16px; }
    .parametros { margin-top: 16px; }
    .fila { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); align-items: center; }
    .guardar { background: #2c4f86; color: #fff; height: 56px; }
    .formula { margin-top: 10px; font-size: 0.8rem; color: #6b7280; }
  `,
})
export class Economia {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly datos = signal<ResumenEconomico | null>(null);
  readonly guardando = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    pension_mensual: [350, [Validators.required, Validators.min(1)]],
    num_estudiantes: [30, [Validators.required, Validators.min(0)]],
    gastos_operativos: [4500, [Validators.required, Validators.min(0)]],
    meses: [5, [Validators.required, Validators.min(1), Validators.max(12)]],
  });

  readonly etiquetasMes = computed(() => this.datos()?.por_mes.map((m) => m.mes) ?? []);
  readonly efectivaMes = computed(() => this.datos()?.por_mes.map((m) => m.efectiva) ?? []);

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<ResumenEconomico>('economia/resumen'));
    if (respuesta.ok && respuesta.datos) {
      this.datos.set(respuesta.datos);
      this.formulario.setValue(respuesta.datos.parametros);
    } else {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
    }
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const respuesta = await firstValueFrom(
      this.api.put<ResumenEconomico>('economia/parametros', this.formulario.getRawValue()),
    );
    this.guardando.set(false);

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });
    if (respuesta.ok && respuesta.datos) {
      this.datos.set(respuesta.datos);
    }
  }
}