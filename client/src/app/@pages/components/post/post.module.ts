import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { pgPost } from './post.component';
@NgModule({
  declarations: [pgPost],
  exports: [pgPost],
  imports: [CommonModule]
})
export class pgPostModule {
  static forRoot(): ModuleWithProviders<pgPostModule> {
    return {
      ngModule: pgPostModule
    };
  }
}
