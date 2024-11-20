import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';  
  }

  getToken(): string | null {
    return localStorage.getItem('userToken');
  }

  setLoginState(isLoggedIn: boolean, token: string | null): void {
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
    if (token) {
      localStorage.setItem('userToken', token);
    }
  }
  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userToken');
  }
}

