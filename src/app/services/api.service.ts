import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../env';
// import { environment } from '../../env';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // private apiKey = 'wFIMP75eG1sQEh8vVAdXykgzF4mLhDw3';
  private API =environment.apiUrl

  constructor(private http: HttpClient) { }

  login(): Observable<any> {
    return this.http.get<any>(`${this.API}/users`).pipe(map((res: any) => {
      return res
    }))
  }
  signUp(data:any): Observable<any> {
    return this.http.post<any>(`${this.API}/users`, data);
  }
  getUserData(userId: string): Observable<any> {
    return this.http.get<any>(`${this.API}/users/${userId}`,);
  }
  
  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.API}/users/${userId}`, userData);
  }

  searchProducts(formData: { searchstring: string; apikey: string }): Observable<any> {
    return this.http.post<any>(`${this.API}`, formData);
  }
  getMedicines():Observable<any> {
    return this.http.get<any>(`${this.API}/medicines`,);
  }
  }
