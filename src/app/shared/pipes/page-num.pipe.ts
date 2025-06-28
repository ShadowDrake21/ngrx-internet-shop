import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pageNum',
})
export class PageNumPipe implements PipeTransform {
  transform([totalCount, itemsPerPage]: [number, number]): number {
    return Math.floor(totalCount / itemsPerPage);
  }
}
