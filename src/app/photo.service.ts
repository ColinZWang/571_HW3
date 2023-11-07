// In your wishlist.service.ts or a new service file if you prefer
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})

export class PhotoService {

  constructor(private http: HttpClient) {}

  getPhotos(productTitle: string): Observable<string[]> {
    // Update the URL to wherever your backend is hosted
    const url = `http://localhost:3000/photos?productTitle=${encodeURIComponent(productTitle)}`;
    return this.http.get<string[]>(url);
  }
}
