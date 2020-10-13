import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { MatSnackBar, MatDialog } from '@angular/material'
import { DialogSocialActivityUserComponent } from '../../dialog/dialog-social-activity-user/dialog-social-activity-user.component'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { ActivatedRoute } from '@angular/router'
import { combineLatest } from 'rxjs'

@Component({
  selector: 'ws-widget-btn-social-vote',
  templateUrl: './btn-social-vote.component.html',
  styleUrls: ['./btn-social-vote.component.scss'],
})
export class BtnSocialVoteComponent implements OnInit {
  @Input() voteType: 'downVote' | 'upVote' | 'none' = 'none'
  @Input() iconType: 'thumbs' | 'triangle' = 'thumbs'
  @Input() postId = ''
  @Input() postCreatorId = ''
  @Input() activity: NsDiscussionForum.IPostActivity = {} as NsDiscussionForum.IPostActivity
  @Input() isDisabled = false
  @ViewChild('invalidUser', { static: true }) invalidUser!: ElementRef<
    any
  >
  @Input() key: any
  @Input()
  userWids: any
  @Input()
  userWidsForUpvote: any
  userForUpvote: any[] = []

  changeText: boolean
  userDetailsForUpVote: any[] = []
  userForDownVote: any[] = []
  userDetailsForDownVote: any[] = []
  userId = ''
  isUpdating = false
  conversationRequest: NsDiscussionForum.IPostRequest = {
    postId: '',
    userId: '',
    answerId: '',
    postKind: [],
    sessionId: Date.now(),
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
    pgNo: 0,
    pgSize: 10,
    postCreatorId: '',
  }
  constructor(
    private configSvc: ConfigurationsService,
    private socialSvc: WsDiscussionForumService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private discussionSvc: WsDiscussionForumService,
    private route: ActivatedRoute,
  ) {
    this.changeText = false
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.conversationRequest.userId = this.userId
  }

  ngOnInit() {
    combineLatest(this.route.data, this.route.paramMap).subscribe(_combinedResult => {
      const idVal = _combinedResult[1].get('id')
      if (idVal) {
        this.conversationRequest.postId = idVal
      }
    })
    this.getWidsForVote()

  }

  upVote(invalidUserMsg: string) {
    // this.getWidsForVote()
    if (this.postCreatorId === this.userId) {
      this.snackBar.open(invalidUserMsg)
      return
    }
    if (this.activity && this.activity.userActivity.upVote) {
      this.downVote(this.invalidUser.nativeElement.value)
      return
    }
    this.isUpdating = true
    const request: NsDiscussionForum.IPostActivityUpdateRequest = {
      activityType: NsDiscussionForum.EActivityType.UPVOTE,
      id: this.postId,
      userId: this.userId,
    }
    this.socialSvc.updateActivity(request).subscribe(
      _ => {
        if (this.activity) {
          if (this.activity.userActivity.downVote) {
            this.activity.userActivity.downVote = false
            this.activity.activityData.downVote -= 1
          } else {
            this.activity.userActivity.upVote = true
            this.activity.activityData.upVote += 1
          }
        }
        this.isUpdating = false
        this.fetchUpdateContent(request.id)
      },
      () => {
        this.isUpdating = false
      },
    )
  }

  downVote(invalidUserMsg: string) {
    if (this.postCreatorId === this.userId) {
      this.snackBar.open(invalidUserMsg)
      return
    }
    if (this.activity && this.activity.userActivity.downVote) {
      this.upVote(this.invalidUser.nativeElement.value)
      return
    }
    this.isUpdating = true
    const request: NsDiscussionForum.IPostActivityUpdateRequest = {
      activityType: NsDiscussionForum.EActivityType.DOWNVOTE,
      id: this.postId,
      userId: this.userId || '',
    }
    this.socialSvc.updateActivity(request).subscribe(
      _ => {
        if (this.activity) {
          if (this.activity.userActivity.upVote) {
            this.activity.userActivity.upVote = false
            this.activity.activityData.upVote -= 1
          } else {
            this.activity.userActivity.downVote = true
            this.activity.activityData.downVote += 1
          }
          this.isUpdating = false
          this.fetchUpdateContent(request.id)
        }
      },
      () => {
        this.isUpdating = false
      },
    )
  }
  fetchUpdateContent(postId: any) {
    // if (forceNew) {
    //   this.conversationRequest.sessionId = Date.now()
    //   this.conversationRequest.pgNo = 0
    // }

    this.discussionSvc.fetchPost(this.conversationRequest).subscribe(data => {
      if (data.mainPost.postCreator.postCreatorId) {
        this.conversationRequest.postCreatorId = data.mainPost.postCreator.postCreatorId
       }
       this.activity.activityDetails = data.mainPost.activity.activityDetails
       if (this.key) {
        data.replyPost.forEach(reply => {
          if (reply.activity.activityDetails) {
          if (reply.id === postId) {
          this.getWidsForVote(reply.activity.activityDetails)
          }
          }
         })
       } else {
          // if (data.mainPost.activity.activityDetails) {
       this.getWidsForVote(data.mainPost.activity.activityDetails)
      //  }
      }
    })
  }
  openVotesDialog(voteType: NsDiscussionForum.EActivityType.DOWNVOTE | NsDiscussionForum.EActivityType.UPVOTE) {
    const data: NsDiscussionForum.IDialogActivityUsers = {
      postId: this.postId,
      activityType: voteType,
    }
    this.dialog.open(DialogSocialActivityUserComponent, {
      data,
    })
  }
  async getWidsForVote(data?: any) {
    if (data) {
      const wids = data.upVote
      if (wids.length) {
        // if (data.upVote.includes()) {
        const userDetails = await this.discussionSvc.getUsersByIDs(wids)
        this.userForUpvote = this.discussionSvc.addIndexToData(userDetails)
        // }
      } else {
        this.userForUpvote = []
      }
      const widsForDownVote = data.downVote
      if (widsForDownVote.length) {
        const userDetailsforDownVote = await this.discussionSvc.getUsersByIDs(widsForDownVote)
        this.userForDownVote = this.discussionSvc.addIndexToData(userDetailsforDownVote)
      } else {
        this.userForDownVote = []
      }
    } else {
    if (this.activity.activityDetails) {
      // filter for upvote
      //  if (this.activity.activityDetails) {
      const wids = this.activity.activityDetails.upVote
      // const wids = ['7b710f74-8f84-427f-bc13-f4220ed2a1c1',
      //   'b690b9c6-a9de-49dd-94ef-1dffcc7a053c']
      if (wids.length) {
        const userDetails = await this.discussionSvc.getUsersByIDs(wids)
        this.userForUpvote = this.discussionSvc.addIndexToData(userDetails)
      }
      // filter for downvote
      //  if (this.activity.activityDetails) {
      const widsForDownVote = this.activity.activityDetails.downVote
      // const widsForDownVote = ['7b710f74-8f84-427f-bc13-f4220ed2a1c1', 'acbf4053-c126-4e85-a0bf-252a896535ea',
      //   'b690b9c6-a9de-49dd-94ef-1dffcc7a053c']
      if (widsForDownVote.length) {
        const userDetailsforDownVote = await this.discussionSvc.getUsersByIDs(widsForDownVote)
        this.userForDownVote = this.discussionSvc.addIndexToData(userDetailsforDownVote)
      }
    }
  }
  console.log(this.userForUpvote, this.userForDownVote)
}
}
  // isEnabled() {
  //   this.isEnabledForDisplay = true;
  // }
