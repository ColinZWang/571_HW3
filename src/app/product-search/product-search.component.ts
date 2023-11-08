import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WishlistService } from '../wishlist.service'; 
import { PhotoService } from '../photo.service';
import { environment } from '../../environments/environment';




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
  activeTab: string = 'results';
  productDetails: any = null;
  images: string[] = [];
  photos: string[] = [];
  noRecordsFound: boolean = false;

  private token: string = '21c03b02289dce'; // token from ipinfo.io

  constructor(private fb: FormBuilder, private http: HttpClient, private wishlistService: WishlistService, private photoService: PhotoService) {}

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
      zipcode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });
    this.getCurrentLocation();
    this.loadWishlist();
  }

  onSearch(): void {
    this.noRecordsFound = false;
    this.displayResults = true;
    this.displayWishlist = false;
    this.activeTab = 'results';
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

    this.http.get<any>(`https://webdev3backend.wm.r.appspot.com/search`, { params: queryParams }).subscribe(
      response => {
        this.searchResults = response;
        console.log(response);
        if (this.searchResults.length === 0) { // Double check in case results have been updated
          this.noRecordsFound = true;
        }
      },
      error => {
        console.error('Error fetching data from the backend', error);
      }
    );
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe(data => {
      this.wishlist = data;
    });
  }

  addToWishlist(item: any) {
    this.wishlistService.addToWishlist(item).subscribe(response => {
      this.loadWishlist(); // reload the wishlist to reflect changes
    });
  }

  removeFromWishlist(index: number) {
    const item = this.wishlist[index];
    console.log("Removing item:", item);
    this.wishlistService.removeFromWishlist(item._id).subscribe(response => {
      this.loadWishlist(); // reload the wishlist to reflect changes
    });
  }  

  showResults(): void {
    this.activeTab = 'results'
    this.displayResults = true;
    this.displayWishlist = false;
  }

  showWishlist(): void {
    this.activeTab = 'wishlist'
    this.displayResults = false;
    this.displayWishlist = true;
  }

  onProductTitleClick(itemId: string): void {
    console.log("Clicked Item ID:", itemId);
    this.getProductDetails(itemId);
    this.activeTab='product'
  }


  getProductDetails(itemId: string): void {
      this.http.get<any>(`https://webdev3backend.wm.r.appspot.com/product/${itemId}`).subscribe(
      data => {
        this.productDetails = data;
        const clickedItem = this.searchResults.find(item => item.itemId === itemId);
        if (clickedItem) {
          this.productDetails.shippingServiceCost = clickedItem.shipping; // Assuming 'shipping' is the key for shipping cost in your searchResults items
        }
        console.log('Product Details: ',data)
      },
      error => {
        console.error('Error fetching data from the backend', error);
      }
    );
    // Hide other sections
    this.displayResults = false;
    this.displayWishlist = false;
  }

  onPhotosTabClick(): void {
    this.activeTab = 'photos';
    console.log('Fetching photos for ', this.productDetails.Title)
    this.photoService.getPhotos(this.productDetails.Title).subscribe(
      (photoUrls) => {
        this.photos = photoUrls;
      },
      (error) => {
        console.error('Error fetching photos:', error);
      }
    );
  }


  getFormattedStoreName(): string {
    if (this.productDetails && this.productDetails.StoreName) {
      return this.productDetails.StoreName.toUpperCase().replace(/\s+/g, '');
    }
    return '';
  }


  getStarColor(feedbackScore: number): string {
    if (feedbackScore >= 1000000) return 'silver-shooting';
    if (feedbackScore >= 500000) return 'green-shooting';
    if (feedbackScore >= 100000) return 'red-shooting';
    if (feedbackScore >= 50000) return 'purple-shooting';
    if (feedbackScore >= 25000) return 'turquoise-shooting';
    if (feedbackScore >= 10000) return 'yellow-shooting';
    if (feedbackScore >= 5000) return 'green';
    if (feedbackScore >= 1000) return 'red';
    if (feedbackScore >= 500) return 'purple';
    if (feedbackScore >= 100) return 'turquoise';
    if (feedbackScore >= 50) return 'blue';
    if (feedbackScore >= 10) return 'yellow';
    return 'none';
  }
  

  backToList(): void {
    this.productDetails = null;
    this.displayResults = true;
    this.activeTab = 'results'
  } 

  changeTab(tabName: string): void {
    this.activeTab = tabName;
  }

  openImageModal(): void {
    // Logic to open modal and display all product images from productDetails.PictureURL
  }

}