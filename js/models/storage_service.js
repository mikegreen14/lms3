import Utils from '../util/utilities.js'
export default class StorageService {
    "use strict"
    constructor(data, entity, entitySingle, options={}) {
       
        this._entity = entity;
        this._entitySingle = entitySingle;
        this.utils = new Utils();
        this.initModel(data, options);
    }

    //Getters and Setters
    get entitySingle() {return this._entitySingle;}
    get entity() {return this._entity;}
    get sortCol() {
        return this.model.options.sortCol;
    }
    set sortCol(col) {
        this.model.options.sortCol = col;
    }
    get sortDir() {
        return this.model.options.sortDir;
    }
    set sortDir(dir) {
        this.model.options.sortDir = dir;
    }
    set filterStr(filterStr) {
        this.model.options.filterStr = filterStr;
    }
    
    get filterStr() {
        return this.model.options.filterStr;
    }
    
    get size() {
        return this.model.data.length;
    }
    get limit() {
        return this.model.options.limit;
    }
    set limit(limit){
        this.model.options.limit=limit;
    }
    get offset() {
        return this.model.options.offset;
    }
   
    
    set options(opt){
        this.model.options={
            sortCol: null,
            sortDir: "asc",
            filterCol:"",
            filterStr:"",
            limit: 100,   //we'll set 100 as limit to start
            offset: null
        };
        //merge any passed in options
        this.model.options = Object.assign(this.model.options, opt);
    }
    //CRUD FUNCTIONS
     initModel(data, options){
        this.model ={};
        this.model.data=[];
        this.options = options;
        if (data!=null){
            this.model.data=data;
        }
        this.origModel = this.utils.cloneObject(this.model);
    }

    async list() {
        throw new Error("must implement list in sub class!")
    }

    async create(obj) {
        throw new Error("must implement create in sub class!")
    }
     async read(getId) {
        throw new Error("must implement read in sub class!")
    }
    async update(id, obj) {
        throw new Error("must implement update in sub class!")
    }

     async delete(removeId) {
        throw new Error("must implement delete in sub class!")
    }

    getItem(id) {
        return this.model.data.find(element => element.id == id);
    }
}