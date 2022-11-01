import LocalStorageService from '../models/local_storage_service.js'
import RestStorageService from '../models/rest_storage_service.js'
import ListView from '../views/list_view.js'

export default class AppController
{
   constructor(appViewModel)
   {
        this.appViewModel = appViewModel;
         //create a local storage service instance using mockData found in 'data' element of view model (see getter)
         this.storageService = new LocalStorageService(this.data, this.entity,this.entitySingle, this.list.options);
        //this.storageService = new RestStorageService(this.data, this.entity,this.entitySingle, this.list.options, this.endPoint);
        //create a ListPageView class, passing in the storage service and view model
        this._view = new ListView(this.storageService, this.listViewModel)
       
    }
    get data(){return this.appViewModel.viewModel.data;}
    get entity(){return this.appViewModel.viewModel.entity;}
    get entitySingle(){return this.appViewModel.viewModel.entitySingle;}
    get list(){ return this.appViewModel.viewModel.list;}
    get listViewModel(){return this.appViewModel.viewModel;}
    get endPoint(){return this.appViewModel.endPoint;}

    get view(){
        return this._view;
    }
    async reset(){
        await this.view.reset();
    }
    async render(){
       await this.view.render();
    }
   
}