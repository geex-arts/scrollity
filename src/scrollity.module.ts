import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

window['_gsQueue'] = window['_gsDefine'] = null;
window['GreenSockGlobals'] = {};

import { ScrollService } from './services/scroll.service';
import { ScrollTriggerDirective } from './directives/scroll-trigger/scroll-trigger.directive';
import { ScrollTriggeredPipe } from './pipes/scrollTriggered.pipe';
import { DocumentService } from './services/document.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ScrollTriggerDirective,
    ScrollTriggeredPipe
  ],
  providers: [
    ScrollService,
    DocumentService
  ],
  exports: [
    ScrollTriggerDirective,
    ScrollTriggeredPipe
  ]
})
export class ScrollityModule {
}
