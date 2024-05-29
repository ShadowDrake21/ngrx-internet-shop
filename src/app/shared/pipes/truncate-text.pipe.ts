// angular stuff
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true,
})
export class TruncateTextPipe implements PipeTransform {
  transform(value: string, length: number): string {
    if (value.length > length) {
      return value.slice(0, length) + '...';
    } else {
      return value;
    }
  }
}
