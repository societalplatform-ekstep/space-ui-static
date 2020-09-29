import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, EventService, UtilityService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { NsGoal } from '../btn-goals/btn-goals.model'
import { NsPlaylist } from '../btn-playlist/btn-playlist.model'
import { NsContent } from '../_services/widget-content.model'
import { NsCardContent } from './card-content.model'
import { ActivatedRoute } from '@angular/router'
import { ContentStripMultipleService } from '../content-strip-multiple/content-strip-multiple.service'

@Component({
  selector: 'ws-widget-card-content',
  templateUrl: './card-content.component.html',
  styleUrls: ['./card-content.component.scss'],
})
export class CardContentComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, AfterViewInit, NsWidgetResolver.IWidgetData<NsCardContent.ICard> {
  @Input() widgetData!: NsCardContent.ICard
  defaultThumbnail = ''
  showFlip = false
  isCardFlipped = false
  showIsMode = false
  showContentTag = false

  btnPlaylistConfig: NsPlaylist.IBtnPlaylist | null = null
  btnGoalsConfig: NsGoal.IBtnGoal | null = null
  prefChangeSubscription: Subscription | null = null
  isIntranetAllowedSettings = false
  allowedToSharePlaylist = true
  constructor(
    private events: EventService,
    private configSvc: ConfigurationsService,
    private utilitySvc: UtilityService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private contentStripSvc: ContentStripMultipleService
  ) {
    super()
  }

  ngOnInit() {
    this.route.data.subscribe(_data => {
      // console.log(_data)
      // tslint:disable-next-line: max-line-length
      if (this.contentStripSvc.isVisibileAccToRoles(_data.pageData.data.authorRestrictions.rolesAllowed.share, _data.pageData.data.authorRestrictions.rolesNotAllowed.share)) {
        this.allowedToSharePlaylist = true
      } else {
        this.allowedToSharePlaylist = false
      }
    })
    // console.log('widget data: ', this.widgetData)
    this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    })

    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }

    if (this.widgetData) {
      this.btnPlaylistConfig = {
        contentId: this.widgetData.content.identifier,
        contentName: this.widgetData.content.name,
        contentType: this.widgetData.content.contentType,
        mode: 'dialog',
      }
      this.btnGoalsConfig = {
        contentId: this.widgetData.content.identifier,
        contentName: this.widgetData.content.name,
        contentType: this.widgetData.content.contentType,
      }
      this.modifySensibleContentRating()
    }

    // required for knowledge board
    // TODO: make it more generic
    this.showFlip = Boolean(this.widgetData.content.reason)
    if (this.widgetData.content.mode) {
      this.showIsMode = this.isLatest(this.convertToISODate(this.widgetData.content.addedOn))
    }
    if (this.widgetData.contentTags) {
      this.showContentTag =
        this.checkCriteria() && this.checkContentTypeCriteria() && this.checkMimeTypeCriteria()
    }
  }

  checkContentTypeCriteria() {
    if (
      this.widgetData.contentTags &&
      this.widgetData.contentTags.excludeContentType &&
      this.widgetData.contentTags.excludeContentType.length
    ) {
      return !this.widgetData.contentTags.excludeContentType.includes(
        this.widgetData.content.contentType,
      )
    }
    return true
  }

  checkMimeTypeCriteria() {
    if (
      this.widgetData.contentTags &&
      this.widgetData.contentTags.excludeMimeType &&
      this.widgetData.contentTags.excludeMimeType.length
    ) {
      return !this.widgetData.contentTags.excludeMimeType.includes(this.widgetData.content.mimeType)
    }
    return true
  }

  checkCriteria() {
    if (
      this.widgetData.contentTags &&
      this.widgetData.contentTags.criteriaField &&
      this.widgetData.contentTags.daysSpan
    ) {
      const dateOffset = 24 * 60 * 60 * 1000 * this.widgetData.contentTags.daysSpan
      const lastDay = new Date()
      lastDay.setTime(lastDay.getTime() - dateOffset)
      if (
        this.convertToISODate(
          this.widgetData.content[this.widgetData.contentTags.criteriaField],
        ).getTime() >= lastDay.getTime()
      ) {
        return true
      }
      return false
    }
    return true
  }

  ngOnDestroy() {
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
  }

  ngAfterViewInit() {
    // this.assignThumbnail()
  }

  get checkDisplayName(): string {
    if (this.widgetData.content.creatorDetails && this.widgetData.content.creatorDetails.length) {
      if (
        !this.widgetData.content.creatorDetails[0].name ||
        this.widgetData.content.creatorDetails[0].name === '' ||
        this.widgetData.content.creatorDetails[0].name === 'null null'
      ) {
        return 'Not Disclosed'
      }
      return this.widgetData.content.creatorDetails[0].name
    }
    if (this.widgetData.content.creatorContacts && this.widgetData.content.creatorContacts.length) {
      if (
        !this.widgetData.content.creatorContacts[0].name ||
        this.widgetData.content.creatorContacts[0].name === '' ||
        this.widgetData.content.creatorContacts[0].name === 'null null'
      ) {
        return 'Not Disclosed'
      }
      return this.widgetData.content.creatorContacts[0].name
    }
    return ''
  }

  get imageIcon(): string[] {
    if (this.widgetData.content.contentType === NsContent.EContentTypes.KNOWLEDGE_ARTIFACT) {
      return ['class', 'Knowledge Artifact']
    }
    if (this.widgetData.content.contentType !== NsContent.EContentTypes.RESOURCE) {
      return ['folder', 'Course']
    }
    switch (this.widgetData.content.mimeType) {
      case NsContent.EMimeTypes.HTML:
        return ['library_add', this.widgetData.content.resourceType]
      // tslint:disable-next-line: max-line-length
      case NsContent.EMimeTypes.MP3:
      case NsContent.EMimeTypes.MP4:
      case NsContent.EMimeTypes.M4A:
      case NsContent.EMimeTypes.M3U8:
      case NsContent.EMimeTypes.PLAYLIST:
      case NsContent.EMimeTypes.YOUTUBE:
        return ['library_music', this.widgetData.content.resourceType]
      case NsContent.EMimeTypes.PDF:
        return ['picture_as_pdf', this.widgetData.content.resourceType]
      // tslint:disable-next-line: max-line-length
      case NsContent.EMimeTypes.QUIZ:
      case NsContent.EMimeTypes.HANDS_ON:
      case NsContent.EMimeTypes.RDBMS_HANDS_ON:
      case NsContent.EMimeTypes.IAP:
      case NsContent.EMimeTypes.CERTIFICATION:
        return ['assignment_ind', this.widgetData.content.resourceType]
      default:
        return ['description', this.widgetData.content.resourceType]
    }
  }

  private modifySensibleContentRating() {
    if (
      this.widgetData.content &&
      this.widgetData.content.averageRating &&
      typeof this.widgetData.content.averageRating !== 'number'
    ) {
      // tslint:disable-next-line: ter-computed-property-spacing
      this.widgetData.content.averageRating = (this.widgetData.content.averageRating as any)[
        this.configSvc.rootOrg || ''
        // tslint:disable-next-line: ter-computed-property-spacing
      ]
    }
    this.widgetData.content.averageRating = this.widgetData.content.averageRating || 0
  }

  get isKnowledgeBoard() {
    return (
      (this.widgetData.content && this.widgetData.content.contentType) ===
      NsContent.EContentTypes.KNOWLEDGE_BOARD
    )
  }

  raiseTelemetry() {
    this.events.raiseInteractTelemetry('click', `${this.widgetType}-${this.widgetSubType}`, {
      contentId: this.widgetData.content.identifier,
      contentType: this.widgetData.content.contentType,
      context: this.widgetData.context,
    })
  }

  get isGreyedImage() {
    if (
      (this.widgetData.content && this.widgetData.content.status === 'Deleted') ||
      this.widgetData.content.status === 'Expired'
    ) {
      return true
    }
    return false
  }

  convertToISODate(date = ''): Date {
    try {
      return new Date(
        `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}${date.substring(
          8,
          11,
        )}:${date.substring(11, 13)}:${date.substring(13, 15)}.000Z`,
      )
    } catch (ex) {
      return new Date(new Date().setMonth(new Date().getMonth() - 1))
    }
  }

  isLatest(addedOn: Date) {
    if (addedOn) {
      const dateOffset = 24 * 60 * 60 * 1000 * 7
      const last7Day = new Date()
      last7Day.setTime(last7Day.getTime() - dateOffset)
      if (addedOn.getTime() >= last7Day.getTime()) {
        return true
      }
    }
    return false
  }

  get showIntranetContent() {
    if (this.widgetData.content.isInIntranet && this.utilitySvc.isMobile) {
      return !this.isIntranetAllowedSettings
    }
    return false
  }

  showSnackbar() {
    if (this.showIntranetContent) {
      this.snackBar.open('Content is only available in intranet', undefined, { duration: 2000 })
    } else if (!this.isLiveOrMarkForDeletion) {
      this.snackBar.open('Content may be expired or deleted', undefined, { duration: 2000 })
    }
  }

  get isLiveOrMarkForDeletion() {
    if (
      !this.widgetData.content.status ||
      this.widgetData.content.status === 'Live' ||
      this.widgetData.content.status === 'MarkedForDeletion'
    ) {
      return true
    }
    return false
  }

  openComment() { }
}
