import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { PublicUserViewRoutingModule } from './public-user-view-routing.module'
import { PublicUserViewComponent } from './components/public-user-view/public-user-view.component'
import { MatCardModule } from '@angular/material/card'
import { MatToolbarModule, MatProgressSpinnerModule, MatButtonModule, MatFormFieldModule, MatInputModule,  MatSnackBarModule } from '@angular/material'

import { BtnPageBackModule } from '@ws-widget/collection'
import { MatIconModule } from '@angular/material/icon'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { PublicUsersCoreService } from './services/public-users-core.service'
import { PublicUsercardComponent } from './components/public-user-card/public-user-card.component'
import { PublicUserInvitationComponent } from './components/public-user-invitation/public-user-invitation.component'
import { PublicUsersUtilsService } from './services/public-users-utils.service'
import { PublicUserDialogComponent } from './components/public-user-dialog/public-user-dialog.component'
import { MatDialogModule } from '@angular/material/dialog'
import { MatTooltipModule } from '@angular/material/tooltip'

@NgModule({
  declarations: [PublicUserViewComponent, PublicUsercardComponent, PublicUserInvitationComponent, PublicUserDialogComponent],
  providers: [PublicUsersCoreService, PublicUsersUtilsService],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    InfiniteScrollModule,
    PublicUserViewRoutingModule,
    MatToolbarModule,
    BtnPageBackModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    FormsModule,
  ],
  entryComponents: [PublicUserDialogComponent],
})
export class PublicUserViewModule { }
