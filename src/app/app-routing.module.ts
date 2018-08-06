import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HistoryComponent } from './history/history.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { ShellComponent } from './shell/shell.component';
import { AuthenticatedGuard } from './authenticated.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: 'history',
        component: HistoryComponent,
      },
      {
        path: 'calculator',
        component: CalculatorComponent,
      },
      {
        path: '**',
        redirectTo: 'history',
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login',
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {enableTracing: !true, scrollPositionRestoration: 'enabled'}),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppRoutingModule { }
