import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IdeaService } from '../../../services/idea.service';
import { Idea } from '../../../models/model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  ideas: Idea[] = [];
  constructor(private ideaService: IdeaService) { }

  ngOnInit(): void {
    this.ideaService.getAllIdeas().subscribe((list) => (this.ideas = list));
  }

}
