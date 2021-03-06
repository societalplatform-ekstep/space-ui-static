import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { NsDiscussionForum } from '@ws-widget/collection'
import { BlogService } from '../../service/blog.service'

@Component({
  selector: 'ws-app-my-blog',
  templateUrl: './my-blog.component.html',
  styleUrls: ['./my-blog.component.scss'],
})
export class MyBlogComponent implements OnInit {
  validTabIds = ['drafts', 'published']
  activeTabIndex = 0
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  myTimelineRequest: NsDiscussionForum.ITimelineRequest = {
    pgNo: -1,
    pgSize: 20,
    postKind: [NsDiscussionForum.EPostKind.BLOG],
    sessionId: Date.now(),
    type: NsDiscussionForum.ETimelineType.MY_TIMELINE,
    userId: '',
  }

  myDraftsRequest: NsDiscussionForum.ITimelineRequest = {
    pgNo: -1,
    pgSize: 20,
    postKind: [NsDiscussionForum.EPostKind.BLOG],
    sessionId: Date.now(),
    type: NsDiscussionForum.ETimelineType.MY_DRAFTS,
    userId: '',
  }
  userId = ''
  allowedToDiscussionForum = true

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private blogService: BlogService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.myDraftsRequest.userId = this.userId
    this.myTimelineRequest.userId = this.userId
  }

  ngOnInit() {
    this.route.data.subscribe(_data => {
      // console.log(_data)
      // tslint:disable-next-line: max-line-length
      if (this.blogService.isVisibileAccToRoles(_data.pageData.data.rolesAllowed.blog, _data.pageData.data.rolesNotAllowed.blog)) {
        this.allowedToDiscussionForum = true
      } else {
        this.router.navigateByUrl('/page/home')
      }
    })
    this.route.paramMap.subscribe(params => {
      const tabVal = params.get('tab')
      if (tabVal) {
        if (this.validTabIds.includes(tabVal)) {
          this.activeTabIndex = this.validTabIds.indexOf(tabVal)
        }
      }
    })
  }

  updateActiveTab(tabId: number) {
    const tab = this.validTabIds[tabId] || 'drafts'
    this.router.navigate(['../', tab], { relativeTo: this.route })
  }
}
