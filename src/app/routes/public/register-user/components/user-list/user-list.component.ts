import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core'
import { IRegsiterDetailObject } from './../../services/register-user-core.model'
// import { filter } from 'rxjs/operators'
// import { MatTableDataSource } from '@angular/material/table'
// import { MatFormFieldControl } from '@angular/material'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { RegisterUserCoreService } from '../../services/register-user-core.service'
// import { lodash_ } from 'lodash'

// import * as lodash from 'lodash'
// import _ from 'lodash';

@Component({
  selector: 'user-list-component',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class UserListComponent implements OnInit {
  navBackground: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  placeHolder: String = 'Search'

  constructor(private configSvc: ConfigurationsService, private registerUserSrvc: RegisterUserCoreService) {
    // var filteruser = [...new Set(this.users)]

    // const filteruser = [...new Set(this.users.map(x => x.employment_status))]

    // const result = []
    // const map = new Map()
    // for (const item of this.users) {
    //   if (map.has(item.employment_status)) {
    //     map.set(item.employment_status, true)    // set any value to Map
    //     result.push({
    //       id: item.employment_status

    //     })
    //   }
    // }

    // const val = new Set(this.users.map(user => user.employment_status))

  }
  @Input() users: IRegsiterDetailObject[] = []

  @Output() selectedUser = new EventEmitter<object | null>()

  // @Input('rating') private rating: any
  // @Input('starCount') private starCount: any
  // // @Input('color') private color: any
  // @Output() private ratingUpdated = new EventEmitter();
  // private snackBarDuration: number = 2000;

  // private ratingArr = []

  // filteruser: IRegsiterDetailObject[] = []
  // dataSource = new MatTableDataSource(this.users);

  // const filteruser = new Set(this.users.map(x => x.employment_status));
  // const uniqueWorkflowData = lodash.uniqBy(stats, 'workflow');

  searchText: any = 'All'
  filterStatus: any = 'All'
  filterLocation: any
  filterCombo: any[] = []
  myarrayStatus: any
  myarrayLocation: any
  currentRate = 5
  stars = [1, 2, 3, 4, 5]
  rating = 2
  hoverState = 0
  selectedValue: any

  ngOnInit() {

    this.filterUser()
  }

  filterUser() {

    // this.filterStatus = new Set(this.users.map(x => x.employment_status))
    const tempUserArray: any = this.users
    tempUserArray.unshift({ employment_status: 'All', residence_city: 'All' })
    const filterStatus: any = new Set(tempUserArray.map((x: any) => x.employment_status))

    this.myarrayStatus = Array.from(filterStatus)
    const tempArray: any = this.users
    // tempArray.unshift({ residence_city: "All" })
    // this.filterLocation = new Set(this.users.map(x => x.residence_city))
    const filterLocation: any = new Set(tempArray.map((x: any) => x.residence_city))
    //  filterLocation=new Set("All");

    this.myarrayLocation = Array.from(filterLocation)
    // this.filterCombo =
    // this.myarrayLocation.map((location: any) => {
    //   this.myarrayStatus.map((status: any) => {
    //     let combo: any = {
    //       location: location,
    //       status: status
    //     }
    //     this.filterCombo.push(combo)
    //     // return combo
    //   })
    // })

  }

  viewUserDetails(_userObj: any) {
    if (_userObj) {
      this.selectedUser.emit(_userObj)
    }

  }

  //   function onlyUnique(value: any, index: any, self: any) {
  //     return self.indexOf(value) === index
  //   }

  // var  unique = this.users.employment_status.filter(onlyUnique);

  // applyFilter(filterValue: string) {
  //   this.dataSource.filter = filterValue.trim().toLowerCase()
  // }

  // selectPost(registeredUser: any) {
  // }

  // usage example:

  // countStar(star: any) {
  //   this.selectedValue = star
  //   console.log('Value of star', star)
  // }

  onStarEnter(starId: any) {
    this.hoverState = starId

  }
  onStarLeave() {
    this.hoverState = 0
  }
  oStarClick(ratingDataForUser: IRegsiterDetailObject) {
    this.registerUserSrvc.updateRating(ratingDataForUser.source_id as string, ratingDataForUser.rating as number)
      .subscribe(_ratingRes => {
      },         _err => {

      })
  }

}
