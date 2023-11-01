import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductSearchComponent } from './product-search/product-search.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // redirect default route to /home
  { path: 'home', component: ProductSearchComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
