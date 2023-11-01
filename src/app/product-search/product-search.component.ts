import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent {
  productForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      keyword: ['', [Validators.required, Validators.pattern(/\S/)]],
      from: [''], // This directly binds to the radio buttons
      zipcode: ['', [Validators.pattern(/^\d{5}$/)]]
    });    
  }

  get keyword() { return this.productForm.get('keyword'); }
  get from() { return this.productForm.get('from'); }  // This getter is for the radio buttons
  get zipcode() { return this.productForm.get('zipcode'); }  
}
