import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '../../model/article.model';
import { BackendService } from '../../services/backend.service';



@Component({
  selector: 'app-article-preview',
  templateUrl: './article-preview.component.html',
  styleUrls: ['./article-preview.component.scss']
})
export class ArticlePreviewComponent implements OnInit {


  public articleId: string;
  public article: Article;

  public loading: boolean;
  public errorMessage: string;


  constructor(
    private route: ActivatedRoute,
    private backendService: BackendService,
  ) { }


  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.articleId = routeParams.get('articleId');

    this.retrieveArticle();
  }


  private async retrieveArticle() {

    this.errorMessage = null;

    try {
      this.loading = true;
      const response = await this.backendService.getArticles([this.articleId]).toPromise();
      this.loading = false;

      if (!response || response.length === 0) {
        this.loading = false;
        this.errorMessage = 'ERROR: Could not retrieve article.';
        return;
      }

      this.article = response[0];

    } catch (e) {
      this.loading = false;
      this.errorMessage = 'ERROR: Could not retrieve article.';
    }
  }

}
