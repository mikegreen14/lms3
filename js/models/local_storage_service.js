import StorageService from './storage_service.js'

export default class LocalStorageService extends StorageService {
    "use strict"
    constructor(data, entity, entitySingle, options={}) {
        super(data, entity, entitySingle, options)
        this.model.nextId=10000;
    }

    //CRUD FUNCTIONS
     initModel(data, options){
        super.initModel(data,options);
        this.retrieve();
    }

    async list() {
        this.sort(super.sortCol, super.sortDir, true);
        let filterObj={};
        
        if (super.filterStr){
            filterObj[super.sortCol]=super.filterStr;
            return this.filter(filterObj);
        }
        
        return this.model.data;
    }
    get nextId(){
        let id= this.model.nextId++;
        this.store();
        return id;
    }
     async create(obj) {
        obj.id=this.nextId;   //assign unique id, only for localstorage
        this.model.data.push(obj);
        this.store();
    }
     async read(getId) {
        let data = this.model.data.find(element => element.id == getId);

        if (data === undefined)
            return null;
        else
            return data;
    }
    async update(id, obj) {
        let index = this.getItemIndex(id);
        if (index != -1) {
            //update current data object with form changes
            //cannot just blow away object because form may only be editing a subset
            this.model.data[index]=Object.assign(this.model.data[index], obj);

            this.model.data[index] = obj;
            this.store();
        }
    }

     async delete(removeId) {
        let index = this.getItemIndex(removeId);
        this.model.data.splice(index, 1)

        this.store();
    }

    //LocalStorage Functions
     async reset() {
        this.model = this.cloneObject(this.origModel);
        this.clear();
    }
     async clear() {
        localStorage.removeItem(this.entity);
        localStorage.clear();
    }
     store() {
        localStorage[this.entity] = JSON.stringify(this.model);
    }
     retrieve() {
        if (localStorage.getItem(this.entity) !== null) {
            this.model = JSON.parse(localStorage[this.entity]);
            return true;
        }
        return false;
    }

    //Sorting and Filtering Functions
     sort(col, direction, perm = true) {
        let copy = this.cloneObject(this.model.data);
        let sorted = copy.sort((a, b) => {
            if (a[col] == b[col])
                return 0;
            if (a[col] < b[col]) {
                return direction == "asc" ? -1 : 1;
            }
            if (a[col] > b[col]) {
                return direction == "asc" ? 1 : -1;
            }

        });
        if (perm) {
            this.model.data = sorted;
            super.sortCol = col;
            super.sortDir = direction;

            this.store();
        }
        return sorted;
    }

     filter(filterObj) {
        function filterFunc(team) {
            for (let entity in filterObj) {
                if ( !team[entity].toLowerCase().includes(filterObj[entity].toLowerCase())) {
                    return false;
                }
            }
            return true;
        }
        let result = this.model.data.filter(filterFunc);
        return this.cloneObject(result);
    }

    //Utility functions
    getItemIndex(id) {
        return this.model.data.findIndex(element => element.id == id);

    }
    getItem(id) {
        return this.model.data.find(element => element.id == id);

    }
    cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

}