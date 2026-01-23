import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Injectable({providedIn: 'root'})
@Pipe({
    name: 'groupBy'
})
export class GroupByPipe implements PipeTransform {
    transform<T>(value: T[], property: string): { key: any; value: T[] }[] {
        if (!Array.isArray(value) || !property) return [];

        const getPropertyValue = (obj: any, path: string): any =>
            path.split('.').reduce((acc, part) => acc?.[part], obj);

        const grouped = new Map<any, T[]>();

        for (const item of value) {
            const key = getPropertyValue(item, property);
            const group = grouped.get(key) ?? [];
            group.push(item);
            grouped.set(key, group);
        }

        // Return an array of objects, each object containing a group of objects
        return Array.from(grouped.entries()).map(([key, group]) => ({
            key,
            value: group
        }));
    }
}
