import { Routes } from '@angular/router';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CategorieFormComponent } from './pages/categorie-form/categorie-form.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { ArticlesStockComponent } from './pages/articles-stock/articles-stock.component';
import { ArticleFormComponent } from './pages/article-form/article-form.component';
import { MouvementsStockComponent } from './pages/mouvements-stock/mouvements-stock.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminJournalComponent } from './pages/admin-journal/admin-journal.component';
import { ParametresComponent } from './pages/parametres/parametres.component';
import { FournisseursComponent } from './pages/fournisseurs/fournisseurs.component';
import { FournisseurFormComponent } from './pages/fournisseur-form/fournisseur-form.component';

export const routes: Routes = [
  { path: 'connexion', component: LoginComponent },
  { path: 'inscription', component: RegisterComponent },
  { path: 'mot-de-passe-oublie', component: ForgotPasswordComponent },
  { path: 'reinitialiser-mot-de-passe', component: ResetPasswordComponent },
  { path: 'admin/journal', component: AdminJournalComponent, canActivate: [authGuard, adminGuard] },
  { path: 'parametres', component: ParametresComponent, canActivate: [authGuard, adminGuard]},


  {
    path: 'fournisseurs',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'liste', pathMatch: 'full' },
      { path: 'liste', component: FournisseursComponent },
      { path: 'nouveau', component: FournisseurFormComponent },
      { path: 'modifier/:id', component: FournisseurFormComponent }
    ]
  },

  {
    path: 'articles',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inventaire', pathMatch: 'full' },
      { path: 'inventaire', component: ArticlesComponent },
      { path: 'stock', component: ArticlesStockComponent },
      { path: 'nouveau', component: ArticleFormComponent, canActivate: [adminGuard] }
    ]
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'liste', pathMatch: 'full' },
      { path: 'liste', component: CategoriesComponent },
      { path: 'nouveau', component: CategorieFormComponent, canActivate: [adminGuard] }
    ]
  },
  {
    path: 'mouvements-stock',
    component: MouvementsStockComponent,
    canActivate: [authGuard]
  },
  {
    path: 'mouvements-stock',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'historique', pathMatch: 'full' },
      { path: 'nouveau', component: MouvementsStockComponent },
      { path: 'historique', component: MouvementsStockComponent }
    ]
  },
  {
    path: 'admin/utilisateurs',
    component: AdminUsersComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'profil',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'articles',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'articles'
  }
];