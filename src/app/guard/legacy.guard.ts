import {CanActivateFn, Params, Router} from '@angular/router';
import {inject} from "@angular/core";

const URL_PATTERN = /\/?(?<id>R-[A-Z]{3}-\d+)&?(?<params>.*)/;


export const legacyGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const {fragment, queryParams} = route;
  let params = {...queryParams} as Params;
  let id = 'R-HSA-453279'; // Default routing

  if (fragment) {
    const match = fragment.match(URL_PATTERN);
    if (match && match.groups && match.groups['id']) {
      if (match.groups['id']) {
        id = match.groups['id'];
      }
      if (match.groups['params']) {
        match.groups['params']
          .split("&")
          .map(param => param.split("="))
          .forEach(([key, value]) => {
            params[key] = value || true;
          })
      }
    }
    return router.navigate([id], {fragment: undefined, queryParams: params})
  }

  return router.navigate([id]); // Default routing
};
