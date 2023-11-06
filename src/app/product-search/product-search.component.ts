import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit {
  productForm!: FormGroup;
  results: any[] = [];
  searchResults: any[] = [];
  private token: string = '21c03b02289dce'; // You should get a token from ipinfo.io

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      keyword: ['', Validators.required],
      category: ['All Categories'],
      newCondition: [false],
      usedCondition: [false],
      unspecifiedCondition: [false],
      localpickup: [false],
      freeshipping: [false],
      distance: [''],
      type: ['currentLocation'],
      zipcode: ['', Validators.required]
    });
  }

  onSearch(): void {
    if (this.productForm.get('type')!.value === 'currentLocation') {
        this.getCurrentLocation();
    }
    this.fetchProducts();
  }

  getCurrentLocation(): void {
    this.http.get<any>(`https://ipinfo.io/json?token=${this.token}`).subscribe(response => {
      console.log('Location Data:', response as any);
      const postalCode = response.postal;
      this.productForm.patchValue({zipcode: postalCode});
    }, error => {
      console.error('Error fetching location:', error);
    });
  }

  //... [rest of the code]

fetchProducts(): void {
  const formData = this.productForm.value;
  const queryParams = new HttpParams({
    fromObject: {
      keyword: formData.keyword,
      zipcode: formData.zipcode,
      distance: formData.distance,
      freeshipping: formData.freeshipping ? 'true' : 'false',
      localpickup: formData.localpickup ? 'true' : 'false',
      newCondition: formData.newCondition ? 'true' : 'false',
      usedCondition: formData.usedCondition ? 'true' : 'false',
      unspecifiedCondition: formData.unspecifiedCondition ? 'true' : 'false',
    }
  });
  
    this.http.get<any>('http://localhost:3000/search', { params: queryParams }).subscribe(
      response => {
        this.searchResults = response as any[];
        console.log(response);
      },
      error => {
        console.error('Error fetching data from the backend', error);
      }
    );
  }
}