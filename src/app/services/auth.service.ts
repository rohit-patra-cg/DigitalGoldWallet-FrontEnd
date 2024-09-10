import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from '../models/login';
import { BehaviorSubject, Observable, of } from 'rxjs'
import { userInfo } from 'os';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = "http://localhost:8080/api/auth/login"

  constructor(private http: HttpClient, private router: Router) { }

  private token = new BehaviorSubject<string>("");
  token$: Observable<string> = this.token.asObservable();

  private authenticated: boolean = typeof localStorage !== 'undefined' && !!localStorage.getItem('isAuthenticated');
  private adminAuthenticated: boolean = typeof localStorage !== 'undefined' && !!localStorage.getItem('isAdminAuthenticated');

  get isAuthenticated$(): Observable<boolean> {
    return of(this.authenticated);
  }

  get isAdminAuthenticated$(): Observable<boolean> {
    return of(this.adminAuthenticated);
  }

  login(loginObj: Login): boolean {
    let success: boolean = false;
    this.http.post<any>(this.apiUrl, loginObj).subscribe(
      response => {
        // Storing jwtToken in localstorage
        if (response && response.success) {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem("username", loginObj.username);
            localStorage.setItem("jwtToken", response.jwt);
            if (Number(response.userId) === 1) {
              localStorage.setItem("isAdminAuthenticated", "true");
            } else {
              localStorage.setItem("isAuthenticated", "true");
            }
          }
          this.token.next(response.jwt);
          this.authenticated = true;
          console.log(response.userId);
          
          if (Number(response.userId) === 1) {
            success = true;
            this.router.navigate([`/admin`])
          } else {
            success = true;
            this.router.navigate([`/dashboard/${response.userId}`])
          }
        }
        return response;
      });
    return success;
  }

  logout(): void {
    this.authenticated = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem("username");
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("isAdminAuthenticated");
    }
    this.router.navigate(["/"])
  }
}
