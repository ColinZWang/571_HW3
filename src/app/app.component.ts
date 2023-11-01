import { Component } from '@angular/core';
import { ProductSearchComponent } from './product-search/product-search.component';

@Component({
  selector: 'app-root',
  template: `
  <section>
    <app-product-search></app-product-search> <!-- This will render the product search component -->
  </section>
`,
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'homes';
}
