import { Injectable } from '@angular/core'
import { IActionUpdate } from '../models/public-users.interface';
import { IUserConnections } from '../models/public-users.interface'
import { DUMMY_RESPONSE, CONNECTION_STATUS_CONNECT } from './../constants'
import { Observable, of, BehaviorSubject} from 'rxjs';
import { PublicUsersCoreService } from './public-users-core.service'

import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { catchError, map, delay } from 'rxjs/operators'
@Injectable({
  providedIn: 'root',
})
export class PublicUsersUtilsService {
  isDummy = true
  dummyResponse_connection_list = true
  buttonStatus$:BehaviorSubject<string> = new BehaviorSubject<string>(CONNECTION_STATUS_CONNECT)
  constructor(
    private readonly coreSrvc: PublicUsersCoreService,
    private readonly configSvc: ConfigurationsService,
    ) { }

  sendAction(requestId: string, actionType: string) {
    const currentWID = this.configSvc.userProfile ? this.configSvc.userProfile.userId : ''
    if (this.isDummy) {
      return of({ status: 200, ok: true }).pipe(delay(2000))
    }
    const actionBody: IActionUpdate = {
      actionType,
      requestId,
      wid: currentWID,
    }
    return this.coreSrvc.postInvitationAction(actionBody).pipe(
      catchError(_e => of(null)),
      map(data => data),
      catchError(_e => of(null)),
      delay(2000)
      )
    }
  getConnectionsList(wid:string): Observable<IUserConnections[]>{
    if(this.dummyResponse_connection_list){
      return  of(DUMMY_RESPONSE)
    }
    const requestParams = {
         wid
    }
   return  this.coreSrvc.getConnectionAPIResponse(requestParams).pipe(
     catchError(_err=>of([])),
     map(response=>response)
   )
  }
  updateButtonStatus(){
    this.buttonStatus$.next("pending")
  }
}
