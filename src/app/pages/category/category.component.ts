import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);

  categoryId$!: Observable<number>;

  ngOnInit(): void {
    this.categoryId$ = this.route.queryParamMap.pipe(
      map((params: ParamMap) => +params.get('id')!)
    );
  }
}
