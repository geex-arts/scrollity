import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

if (isPlatformBrowser(PLATFORM_ID)) {
  let global = this || {};

  global['window'] = global['window'] || {};
  global['window']['_gsQueue'] = global['window']['_gsDefine'] = null;
  global['window']['GreenSockGlobals'] = {};
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import 'rxjs/Rx';
import 'gsap';

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
