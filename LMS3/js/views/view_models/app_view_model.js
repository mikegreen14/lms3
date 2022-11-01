/* app_view_model.js */
// import homePageViewModel from './home_page_view_model'
// import teamsPageViewModel from './teams_page_view_model'

// import teamData from '../../models/mock/mock_team_data.js'

// let routes= [
//     {
//         name: "home",
//         title: "Home",
//         defaultOptions:null,
//         isDefaultView: true,
//         view: 
//             {
//                 viewType:"generic",
//                 viewModel: homePageViewModel
//             }
//     },
//     {
//         name: "teams",
//         title: "Teams Page",
//         defaultOptions: "?sortCol=name&sortDir=asc",
//         view: 
//             {
//                 viewType:"list",
//                 viewModel: teamsPageViewModel,
//                 data: teamData  ,
//                 isDefaultView: false
//             }
//     }

// ]
// homePageViewModel.routes=routes;
// let appViewModel= {
//     containerId: "appContainer",     //container in which to render app html
//     routes: routes
//     }

// export default appViewModel;
    

/* App View Model-contains application level meta data */
import teamViewModel from './teams_page_view_model.js'
var appViewModel= {
    endPoint:"localhost:8080",
    viewModel: teamViewModel
}
export default appViewModel;