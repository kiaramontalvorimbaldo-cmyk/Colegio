import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';

/** Módulos aún no construidos: se muestran como pantalla provisional. */
const pendiente = (titulo: string, modulo: string, sprint: string, icono: string) => ({
  loadComponent: () =>
    import('./shared/components/placeholder/placeholder').then((m) => m.Placeholder),
  data: {
    titulo,
    modulo,
    descripcion: 'Funcionalidad en construcción: se habilita en un sprint posterior.',
    sprint,
    icono,
  },
});

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    title: 'Iniciar sesión · Sagrado Corazón',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'docente',
    canActivate: [authGuard, rolGuard('DOCENTE')],
    loadComponent: () => import('./shared/components/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        title: 'Panel del docente · Sagrado Corazón',
        loadComponent: () =>
          import('./features/docente/dashboard/docente-dashboard').then((m) => m.DocenteDashboard),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · Sagrado Corazón',
        loadComponent: () => import('./features/docente/perfil/perfil').then((m) => m.Perfil),
      },
      {
        path: 'cursos-horarios',
        title: 'Cursos y horarios · Sagrado Corazón',
        loadComponent: () =>
          import('./features/docente/cursos-horarios/cursos-horarios').then((m) => m.CursosHorarios),
      },
      {
        path: 'mensajes',
        title: 'Mensajes · Sagrado Corazón',
        loadComponent: () => import('./features/docente/mensajes/mensajes').then((m) => m.Mensajes),
      },
      {
        path: 'asistencia',
        title: 'Asistencia · Sagrado Corazón',
        loadComponent: () => import('./features/docente/asistencia/asistencia').then((m) => m.Asistencia),
      },
      {
        path: 'incidencias',
        title: 'Incidencias · Sagrado Corazón',
        loadComponent: () => import('./features/docente/incidencias/incidencias').then((m) => m.Incidencias),
      },
      {
        path: 'reportes',
        title: 'Mis reportes · Sagrado Corazón',
        loadComponent: () => import('./features/docente/reportes/reportes').then((m) => m.Reportes),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'director',
    canActivate: [authGuard, rolGuard('DIRECTOR')],
    loadComponent: () => import('./shared/components/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        title: 'Panel de la dirección · Sagrado Corazón',
        loadComponent: () =>
          import('./features/director/dashboard/director-dashboard').then((m) => m.DirectorDashboard),
      },
      {
        path: 'incidencias',
        title: 'Incidencias · Dirección',
        loadComponent: () => import('./features/director/incidencias/incidencias').then((m) => m.IncidenciasDirector),
      },
      {
        path: 'evaluacion',
        title: 'Evaluación docente · Dirección',
        loadComponent: () => import('./features/director/evaluacion/evaluacion').then((m) => m.Evaluacion),
      },
      {
        path: 'docentes',
        title: 'Docentes · Dirección',
        loadComponent: () => import('./features/director/docentes/docentes').then((m) => m.Docentes),
      },
      {
        path: 'cursos',
        title: 'Cursos y horarios · Dirección',
        loadComponent: () => import('./features/director/cursos/cursos').then((m) => m.Cursos),
      },
            {
        path: 'mensajeria',
        title: 'Mensajería y UGEL · Dirección',
        loadComponent: () => import('./features/director/mensajeria/mensajeria').then((m) => m.Mensajeria),
      },
      {
        path: 'plantillas-ugel',
        title: 'Plantillas UGEL · Dirección',
        loadComponent: () =>
          import('./features/director/plantillas-ugel/plantillas-ugel').then((m) => m.PlantillasUgel),
      },
      {
        path: 'economia',
        title: 'Panel económico · Dirección',
        loadComponent: () => import('./features/director/economia/economia').then((m) => m.Economia),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];