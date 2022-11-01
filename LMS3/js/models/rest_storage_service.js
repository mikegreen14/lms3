/* RestStorageService Class */
/* Use this template as a starter and complete the items that say 'TODO' */
import StorageService from './storage_service.js'

export default class RestStorageService extends StorageService {
    constructor(data, entity, entitySingle, options = {}, host) {
        super(data, entity, entitySingle, options);
        this.host = host;
    }

    get apiName(){return this.entity;}
    get list() { return this._list }   //getter for last retrieved list, in case you don't want to call list again

    /* List function*/
    async list(options = this.model.options) {

        let apiName = this.apiName;
        let url = `http://${this.host}/${apiName}/${this.utils.getQueryString(options)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            this._list = data;

            // if (options.is_lookup != null) {
            //     //store lookups for use later
            //     this._lookups[options.alt_table] = data;
            // }
            // else {
            //     //otherwise, just get the normal list data.
            //     this._list = data;
            // }
            return data;
        }
        catch (msg) {
            console.log(msg);
            throw (msg);
        }
    }

    async read(id) {

        return fetch(`http://${this.host}/${this.apiName}/${id}`).then(out => out.json()).catch(e => {
            console.error(e);
            return null;
        });
    }

    async update(id, postData) {
        
        return fetch(`http://${this.host}/${this.apiName}/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        }).then(out => out.json()).catch(e => {
            console.error(e);
            return null;
        });
    }

    async create(postData) {
        
        return fetch(`http://${this.host}/${this.apiName}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        }).then(out => out.json()).catch(e => {
            console.error(e);
            return null;
        });
    }

    async delete(id) {
        
        return fetch(`http://${this.host}/${this.apiName}/${id}`, {
            method: "DELETE"
        }).then(out => out.json()).catch(e => {
            console.error(e);
            return null;
        });
    }

    /* getLookup */
    /* This function passes two additional query string params to the 'list' call
       You will need to modify your list code in the REST API to return an array of objects that
       contain  just 'label' (name for Team, first_name+""+last_name for player) and 'value' (id of team/coach)
     
        Here's an example of what this object will look like
         {
             "teams": [{"label":"Raptors","value":"1"}, ....],
             "coaches": [{"label":"John Jenson","value":"2"}, ....]
         }
         As you retrieve lookups, they will be stored in the service so you don't need
         to look them up again.
         
    */
    async getLookup(name) {
        if (!(name in this._lookups)) {  //if not cached yet, call
            await this.list({
                is_lookup: true,
                alt_table: name
            });
        }

        return this._lookups[name];
    }
    
}