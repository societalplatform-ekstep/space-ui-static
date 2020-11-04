import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MatSnackBar, MatDialog } from '@angular/material'
import { TFetchStatus, ConfigurationsService, NsPage } from '@ws-widget/utils'
import { DialogSocialDeletePostComponent, NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection'
import { combineLatest } from 'rxjs'
import { ForumService } from '../service/forum.service'
import { BtnSocialLikeService } from '@ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/service/btn-social-like.service'

@Component({
  selector: 'ws-app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss'],
})
export class PostViewComponent implements OnInit {
  conversation: NsDiscussionForum.IPostResult | null = null
  isFirstConversationRequestDone = false
  showSocialLike = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  conversationRequest: NsDiscussionForum.IPostRequest = {
    postId: '',
    userId: '',
    answerId: '',
    postKind: [],
    sessionId: Date.now(),
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
    pgNo: 0,
    pgSize: 10,
  }
  fetchStatus: TFetchStatus = 'none'
  canUserEdit = false
  replyEnabled = false
  commentText = ''
  postingReply = false
  resetEditor = false
  userEmail = ''
  userId = ''
  allowedToCreateBlogs = false
  allowedToViewMyBlogs = false

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private route: ActivatedRoute,
    private router: Router,
    private discussionSvc: WsDiscussionForumService,
    private readonly forumSrvc: ForumService,
    private voteService: BtnSocialLikeService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      this.userEmail = this.configSvc.userProfile.email || ''
    }
    this.conversationRequest.userId = this.userId
  }

  ngOnInit() {
    this.voteService.callComponent.subscribe((data: any) => {
      if (data) {
        this.discussionSvc.fetchPost(this.conversationRequest).toPromise().then((updatedData: any) => {
          this.conversation = updatedData
          // console.log('main', this.conversation)
      })
    }
    })
    combineLatest([this.route.data, this.route.paramMap]).subscribe(_combinedResult => {
      // tslint:disable-next-line: max-line-length
      if (!this.forumSrvc.isVisibileAccToRoles(_combinedResult[0].socialData.data.rolesAllowed.blogs, _combinedResult[0].socialData.data.rolesNotAllowed.blogs)) {
        this.allowedToCreateBlogs = false
        this.allowedToViewMyBlogs = false
      } else {
        this.allowedToCreateBlogs = true
        this.allowedToViewMyBlogs = true
      }
      const params = _combinedResult[1]
      const idVal = params.get('id')
      if (idVal) {
        this.conversationRequest.postId = idVal
        this.fetchConversationData()
      }
    })
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
  }

  fetchConversationData(forceNew = false) {
    if (this.fetchStatus === 'fetching') {
      return
    }
    this.fetchStatus = 'fetching'
    if (forceNew) {
      this.conversationRequest.sessionId = Date.now()
      this.conversationRequest.pgNo = 0
    }
    this.discussionSvc.fetchPost(this.conversationRequest).subscribe(
      data => {
        if (this.conversationRequest && this.conversationRequest.pgNo) {
          this.conversationRequest.pgNo += 1
        }
        if (!this.isFirstConversationRequestDone && data && data.mainPost) {
          this.conversation = data
          if (this.conversation.mainPost.status === NsDiscussionForum.EPostStatus.DRAFT) {
            this.router.navigate(['../', 'edit', this.conversationRequest.postId], {
              relativeTo: this.route,
            })
          } else if (this.conversation.mainPost.status === 'Inactive') {
            // todo error route
            this.router.navigate(['error', 'forbidden'])
          }
          this.isFirstConversationRequestDone = true
          if (
            this.conversation &&
            this.conversation.mainPost &&
            this.conversation.mainPost.postCreator &&
            this.userId === this.conversation.mainPost.postCreator.postCreatorId
          ) {
            this.canUserEdit = (this.allowedToCreateBlogs && this.allowedToViewMyBlogs) ? true : false
          }
          this.fetchStatus = 'done'
        } else if (this.isFirstConversationRequestDone) {
          if (data && data.replyPost && data.replyPost.length && this.conversation) {
            if (forceNew) {
              this.conversation.replyPost = [...data.replyPost]
            } else {
              this.conversation.replyPost = [...this.conversation.replyPost, ...data.replyPost]
            }
            this.conversation.newPostCount = data.newPostCount
            this.conversation.postCount = data.postCount
          }
          this.fetchStatus = 'done'
        } else {
          if (!this.conversation) {
            this.fetchStatus = 'none'
          } else {
            this.fetchStatus = 'done'
          }
        }
      },
      (_err: any) => {
        if (!this.conversation) {
          this.fetchStatus = 'none'
        }
      },
    )
  }

  deleteBlog(successMsg: string) {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: this.conversationRequest.postId },
    })
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.router.navigate(['app', 'social', 'forums', 'my-forum-post'])
        this.snackBar.open(successMsg)
      }
    })
  }

  publishReply(failureMsg: string) {
    this.postingReply = true
    const request: NsDiscussionForum.IPostCommentRequest = {
      parentId: this.conversationRequest.postId,
      postContent: {
        body: this.commentText,
      },
      postCreator: this.userId || '',
      postKind: NsDiscussionForum.EReplyKind.REPLY,
      source: {
        id: '',
        name: NsDiscussionForum.EDiscussionType.SOCIAL,
      },
    }
    this.discussionSvc.publishPost(request).subscribe(
      _ => {
        this.fetchConversationData(true)
        this.postingReply = false
        this.resetEditor = true
        setTimeout(
          () => {
            this.resetEditor = false
          },
          0,
        )
        this.replyEnabled = false
        this.commentText = ''
      },
      (_err: any) => {
        this.snackBar.open(failureMsg)
        this.postingReply = false
      },
    )
  }

  onDeleteReply(replyIndex: number) {
    if (this.conversation) {
      this.conversation.replyPost.splice(replyIndex, 1)
    }
  }

  onTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.replyEnabled = eventData.isValid
    this.commentText = eventData.htmlText
  }
}
