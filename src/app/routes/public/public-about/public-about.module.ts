import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicAboutComponent } from './public-about.component'
import {
  MatToolbarModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatCardModule,
  MatButtonModule,
} from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule } from '@ws-widget/utils'
import { WidgetResolverModule } from '../../../../../library/ws-widget/resolver/src/public-api'

@NgModule({
  declarations: [PublicAboutComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    BtnPageBackModule,
    MatButtonModule,
    WidgetResolverModule,
    HorizontalScrollerModule,
    PipeSafeSanitizerModule,
  ],

  exports: [PublicAboutComponent],
})
export class PublicAboutModule {}
