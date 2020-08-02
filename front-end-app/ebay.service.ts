import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EbayService {

  constructor(private http: HttpClient) { }

  searchResults(query) {
    var url = "https://web-tech-hw8-server.wl.r.appspot.com/search?" + query;
    console.log(url);
    return this.http.get<string>(url);

  }
}