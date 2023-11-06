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
  displayResults: boolean = false;
  displayWishlist: boolean = false;
  wishlist: any[] = [];
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
      distance: ['10'],
      type: ['currentLocation'],
      zipcode: ['', Validators.required]
    });
    this.getCurrentLocation();
  }

  onSearch(): void {
    this.displayResults = true;
    this.displayWishlist = false;
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



  fetchProducts(): void {
    const formData = this.productForm.value;

    const queryParamsData: any = {
      keyword: formData.keyword,
      zipcode: formData.zipcode
    };
    
    if (formData.distance) queryParamsData.distance = formData.distance;
    if (formData.freeshipping) queryParamsData.freeshipping = 'true';
    if (formData.localpickup) queryParamsData.localpickup = 'true';
    if (formData.newCondition) queryParamsData.newCondition = 'true';
    if (formData.usedCondition) queryParamsData.usedCondition = 'true';
    if (formData.unspecifiedCondition) queryParamsData.unspecifiedCondition = 'true';
    if (formData.category) queryParamsData.category = formData.category;


    const queryParams = new HttpParams({ fromObject: queryParamsData });

    this.http.get<any>('http://localhost:3000/search', { params: queryParams }).subscribe(
      response => {
        this.searchResults = response;
        console.log(response);
      },
      error => {
        console.error('Error fetching data from the backend', error);
      }
    );
  }

  addToWishlist(product: any): void {
    this.wishlist.push(product);
  }

  removeFromWishlist(index: number): void {
    // Find the index of the item in the wishlist array
    const itemIndex = this.wishlist.findIndex(item => item.index === index);

    // Remove the item if it's found
    if (itemIndex > -1) {
        this.wishlist.splice(itemIndex, 1);
    }
  }


  showResults(): void {
    this.displayResults = true;
    this.displayWishlist = false;
  }

  showWishlist(): void {
    this.displayResults = false;
    this.displayWishlist = true;
  }

}