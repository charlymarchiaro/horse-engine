import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrapScrollDirective } from './trap-scroll-directive';



@NgModule({
  declarations: [TrapScrollDirective],
  imports: [
    CommonModule
  ],
  exports: [
    TrapScrollDirective,
  ]
})
export class DirectivesModule { }
