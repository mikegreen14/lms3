export default class Utilities{

    constructor()
    {
       this.files={}
    }
    async getFileContents(url){
        if (!(url in this.files)){
            this.files[url]=await $.get(url);
        }
       
        return this.files[url]
        
     }
     getQueryString(options = this.options) {     //string to break out options object into a query string
        let query = "?";
        let count = 0;
        for (var key in options) {
            if (options[key]) {
                query += count > 0 ? "&" : "";
                query += `${key}=${options[key]}`;
                count++;
            }
        }
        return query.length > 1 ? query : "";
    }
    cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}