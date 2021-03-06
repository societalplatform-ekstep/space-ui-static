import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NSProfileData } from '../models/profile.model'
import { ITimeSpent } from '../routes/learning/models/learning.models'
import { ConfigurationsService } from '@ws-widget/utils'

const PROTECTED_SLAG_V8 = `/apis/protected/v8`

const LA_API = `/LA1/api`
const LA_API_END_POINTS = {
  USER_ORG_GRAPH: `${PROTECTED_SLAG_V8}/user/dashboard/userOrgTime`,
  TIME_SPENT: `${LA_API}/timespent`,
  NSO_PROGRESS: `${LA_API}/nsoArtifactsAndCollaborators`,
  SKILL_DATA: `${LA_API}/managerRecommendedSkills`,
}
interface IResponse {
  ok: boolean
  error?: string | null,
  // DATA?: [NsUserDashboard.IUserListData],
  DATA?: string,
  STATUS?: string,
  MESSAGE: string,
  ErrorResponseData?: string,
  API_ID?: string,
  STATUS_CODE?: number,
}
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  httpOptions = {
    headers: new HttpHeaders({
      validator_URL: `https://${this.configSvc.hostPath}/apis/protected/v8/user/validate`,
    }),
  }
  baseUrl = this.configSvc.sitePath
  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }
  userData: any

  fetchConfigFile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/feature/profile.json`).pipe()
  }

  setUserEditProfileConfig(userDataFromConfig: any) {
    this.userData = userDataFromConfig
  }
  timeSpent(
    startDate: string,
    endDate: string,
    contentType: string,
    isCompleted: number,
  ): Observable<NSProfileData.ITimeSpentResponse> {
    return this.http.get<NSProfileData.ITimeSpentResponse>(
      `${LA_API_END_POINTS.TIME_SPENT}?startDate=${startDate}&endDate=${endDate}&isCompleted=${isCompleted}&contentType=${contentType}`,
      this.httpOptions,
    )
  }

  nsoArtifacts(
    startDate: string,
    endDate: string,
    contentType: string,
    isCompleted: number,
  ): Observable<NSProfileData.INsoResponse> {
    return this.http.get<NSProfileData.INsoResponse>(
      `${LA_API_END_POINTS.NSO_PROGRESS}?startDate=${startDate}&endDate=${endDate}&isCompleted=${isCompleted}&contentType=${contentType}`,
      this.httpOptions,
    )
  }

  getDashBoard(startDate: string, endDate: string): Observable<ITimeSpent> {
    // tslint:disable-next-line:max-line-length
    return this.http.get<ITimeSpent>(
      `${LA_API_END_POINTS.USER_ORG_GRAPH}?startdate=${startDate}&enddate=${endDate}`,
    )
  }

  async editProfile(widUser: string, params: any): Promise<IResponse> {
    const responseBodyAsJSON = {
      wid: widUser,
      userFirstName: params.userFirstName.value,
      userLastName: params.userLastName.value,
      sourceProfilePicture: params.sourceProfilePicture.value,
      userProperties: {
        bio: params.bio.value,
        profileLink: params.profileLink.value,
      },
      userOrganisation: params.userOrganisation.value,
    }
    try {
      // tslint:disable-next-line: prefer-template
      // tslint:disable-next-line: max-line-length
      const responseData = await this.http.patch<IResponse>(this.userData.API_END_POINT + this.userData.edit_profile.url, responseBodyAsJSON).toPromise()
      if (responseData && responseData.STATUS === 'OK') {
        return Promise.resolve({
          ok: true,
          DATA: responseData.DATA,
          MESSAGE: responseData.MESSAGE,
        })
      }
      return { ok: false, error: responseData.MESSAGE, MESSAGE: responseData.MESSAGE }
    } catch (ex) {
      if (ex) {
        return Promise.resolve({
          ok: false, error: ex,
          MESSAGE: this.userData.edit_profile.errorMessage,
        })
      }
      return Promise.resolve({ ok: false, error: null, MESSAGE: this.userData.edit_profile.errorMessage })
    }
  }

}
