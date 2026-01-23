import {effect, Injectable, signal} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DarkService {

  private _body: HTMLBodyElement | null;

  public readonly isDark = signal(false);

  constructor() {
    this._body = document.querySelector('body');

    effect(() => {
      const value = this.isDark()
      localStorage.setItem('is-dark', JSON.stringify(value));
      if (value) this._body?.classList.add('dark');
      else this._body?.classList.remove('dark');
    });

    // Update theme if other tabs are changing it
    // window.addEventListener('storage', (e) => {
    //   if (e.key === 'is-dark') this.isDark = JSON.parse(e.newValue || 'false');
    // });

    const localValue = localStorage.getItem('is-dark');
    if (localValue) this.isDark.set(JSON.parse(localValue));
    else if (window.matchMedia('(prefers-color-scheme)').media !== 'not all') {
      this.isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }
}
