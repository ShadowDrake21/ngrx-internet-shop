import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clearURL',
  standalone: true,
})
export class ClearURLPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/^["\[]+|["\]]+$/g, '');
  }
}
