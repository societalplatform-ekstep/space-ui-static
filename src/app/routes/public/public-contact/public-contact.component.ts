import { Component, OnInit, OnDestroy } from '@angular/core'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { ValueService } from '@ws-widget/utils/src/public-api'
@Component({
  selector: 'ws-public-contact',
  templateUrl: './public-contact.component.html',
  styleUrls: ['./public-contact.component.scss'],
})
export class PublicContactComponent implements OnInit, OnDestroy {
  contactUsMail = ''
  contactPage: any
  platform = 'Wingspan'
  panelOpenState = false
  isXSmall$ = this.valueSvc.isXSmall$
  isXSmall = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  private subscriptionContact: Subscription | null = null

  constructor(private configSvc: ConfigurationsService, private activateRoute: ActivatedRoute,
              private valueSvc: ValueService) { }

  ngOnInit() {
    this.subscriptionContact = this.activateRoute.data.subscribe(data => {
      this.contactPage = data.pageData.data
    })
    if (this.configSvc.instanceConfig) {
      this.contactUsMail = this.configSvc.instanceConfig.mailIds.contactUs
    }
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }

  ngOnDestroy() {
    if (this.subscriptionContact) {
      this.subscriptionContact.unsubscribe()
    }
  }
}
