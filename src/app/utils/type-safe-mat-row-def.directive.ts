import {CdkRowDef} from '@angular/cdk/table';
import {Directive, Input} from '@angular/core';
import {MatRowDef, MatTableDataSource} from "@angular/material/table";
import {Observable} from "rxjs";

// https://nartc.me/blog/typed-mat-cell-def

@Directive({
  selector: '[matRowDef]', // same selector as MatRowDef
  providers: [{ provide: CdkRowDef, useExisting: TypeSafeMatRowDef }],
})
export class TypeSafeMatRowDef<T> extends MatRowDef<T> {
  // leveraging syntactic-sugar syntax when we use *matRowDef
  // @Input() cdkRowDefDataSource?: T[] | Observable<T[]> | DataSource<T>;
  @Input({required: true}) matRowDefDataSource!: T[] | Observable<T[]> | MatTableDataSource<T>;

  // ngTemplateContextGuard flag to help with the Language Service
  static ngTemplateContextGuard<T>(
    dir: TypeSafeMatRowDef<T>,
    ctx: unknown
  ): ctx is { $implicit: T; index: number } {
    return true;
  }
}
