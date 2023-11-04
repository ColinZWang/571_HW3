import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent {
  productForm: FormGroup;
  private token = '21c03b02289dce';
  products: any[] = [];  // Store the products returned from the backend

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.productForm = this.fb.group({
      keyword: ['', [Validators.required, Validators.pattern(/\S/)]],
      category: ['All Categories'],
      newCondition: [false],
      usedCondition: [false],
      unspecifiedCondition: [false],
      localpickup: [false],
      freeshipping: [false],
      distance: ['10'],
      from: [''], 
      zipcode: ['', [Validators.pattern(/^\d{5}$/)]]
    });
    
  }

  get keyword() { return this.productForm.get('keyword'); }
  get from() { return this.productForm.get('from'); }
  get zipcode() { return this.productForm.get('zipcode'); }  

  onSearch() {
    if (this.from!.value === 'currentLocation') {
        this.getCurrentLocation();
    } else {
        this.fetchProducts();
    }
  }

  

  getCurrentLocation() {
    this.http.get(`https://ipinfo.io/json?token=${this.token}`).subscribe(response => {
      const locationData = response as any; 
      console.log('Location Data:', locationData);
      const postalCode = locationData.postal;
      this.productForm.patchValue({zipcode: postalCode});
      this.fetchProducts();
    }, error => {
      console.error('Error fetching location:', error);
    });
  }

  fetchProducts() {
    const params = new HttpParams({
        fromObject: {
            keyword: this.keyword!.value,
            zipcode: this.zipcode!.value,
            category: this.productForm.get('category')!.value,
            new: this.productForm.get('newCondition')!.value ? 'true' : 'false',
            used: this.productForm.get('usedCondition')!.value ? 'true' : 'false',
            unspecified: this.productForm.get('unspecifiedCondition')!.value ? 'true' : 'false',
            localpickup: this.productForm.get('localpickup')!.value ? 'true' : 'false',
            freeshipping: this.productForm.get('freeshipping')!.value ? 'true' : 'false',
            distance: this.productForm.get('distance')!.value
        }
    });

    const apiUrl = `http://localhost:3000/search`;
    this.http.get(apiUrl, { params }).subscribe(response => {
        this.products = response as any[];
    }, error => {
        console.error('Error fetching products:', error);
    });
  }
}

