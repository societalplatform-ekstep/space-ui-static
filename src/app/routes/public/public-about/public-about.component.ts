import { Component, OnInit, OnDestroy } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { DomSanitizer, SafeResourceUrl, SafeStyle } from '@angular/platform-browser'
import { map } from 'rxjs/operators'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { IAboutObject } from './about.model'
import { IWidgetsPlayerMediaData } from '../../../../../library/ws-widget/collection/src/public-api'
import { NsWidgetResolver } from '../../../../../library/ws-widget/resolver/src/public-api'

@Component({
  selector: 'ws-public-about',
  templateUrl: './public-about.component.html',
  styleUrls: ['./public-about.component.scss'],
})
export class PublicAboutComponent implements OnInit, OnDestroy {
  objectKeys = Object.keys
  headerBanner: SafeStyle | null = null
  footerBanner: SafeStyle | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  aboutPage: IAboutObject | null = null
  private subscriptionAbout: Subscription | null = null

  isSmallScreen$ = this.breakpointObserver
    .observe(Breakpoints.XSmall)
    .pipe(map(breakPointState => breakPointState.matches))

  videoLink: SafeResourceUrl | null = null
  aboutImage: SafeStyle | null = null
  widgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > = {
      widgetData: {
        url: 'assets/instances/space/videos/intro_video.mp4',
        autoplay: true,
        identifier: '',
      },
      widgetHostClass: 'video-full block',
      widgetSubType: 'playerVideo',
      widgetType: 'player',
      widgetHostStyle: {
        height: '100%',
        'max-width': '90%',
        'margin-left': 'auto',
        'margin-right': 'auto',
      },
    }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private activateRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.subscriptionAbout = this.activateRoute.data.subscribe(data => {
      this.aboutPage = data.pageData.data
      if (this.aboutPage && this.aboutPage.banner && this.aboutPage.banner.videoLink) {
        this.videoLink = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.aboutPage.banner.videoLink,
        )
      }
    })

    if (this.configSvc.instanceConfig) {
      (this.headerBanner = this.domSanitizer.bypassSecurityTrustStyle(
        `url('${this.configSvc.instanceConfig.logos.aboutHeader}')`,
      )),
        (this.footerBanner = this.domSanitizer.bypassSecurityTrustStyle(
          `url('${this.configSvc.instanceConfig.logos.aboutFooter}')`,
        ))
      this.aboutImage = this.configSvc.instanceConfig.banners.aboutBanner
    }
  }

  ngOnDestroy() {
    if (this.subscriptionAbout) {
      this.subscriptionAbout.unsubscribe()
    }
  }
}
