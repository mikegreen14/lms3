/*ListPageView Class implementation
Find the 'TODO' tags inline and write the code for those functions.
I will walk through implementation in class and provide recordings.  Try NOT to copy the code from the recordings.  Try to do it yourself first.  
That will be much better practice.  LMS3 will require you to repeat these patterns yourself for the Forms module.
Whatever you do, do not copy and paste!  Type all of the code manually into your LMS1 project.
*/

class ListPageView 
{
    constructor(storageService, viewModel)
    {
        this.storage = storageService;
        this.viewModel = viewModel;
        this.listTemplateHtml="";
        this.wrapperTemplateHtml="";
        this.searchWaiter=null;   //used to hold timeout instance for search
    }
    /* GETTERS AND SETTERS */
    get list() {
        return this.viewModel.list;
    }

    get view() {return this.viewModel;}                 //get viewModel as 'view'
   
    get wrapperTemplateUrl() {return this.view.wrapperTemplateUrl;}
    get $wrapperContainer() { return $("#"+this.view.wrapperContainerId); }

    get $listContainer() { return $("#"+this.view.listContainerId); }
    get listTemplateUrl() {return this.view.listTemplateUrl;}
   
    get columns(){return this.view.list.columns;}       //get columns needed for table
    
    get $alertContainer() { return $("#"+this.view.alertContainerId); }   //get jquery wrapped alert container for displaying alerts
    get $modal() {return $("#"+this.view.modalContainerId); }           //get jquery wrapped modal container
    //used to get a reference to the header icon associated with current sort col and direction, example column html is below
    // <th class="thead sortable bg-black bg-gradient" data-name="name"> Team Name 
    //     <i id="name-asc" class="fa fa-arrow-up" aria-hidden="true" style="display:none"></i> 
    //     <i id="name-desc" class="fa fa-arrow-down" aria-hidden="true" style="display:none"></i>
    //</th>
    get $headerIcon() { return $(`#${this.storage.sortCol}-${this.storage.sortDir}`)}    

     reset(){
        this.storage.reset();
        this.render();
    }
    async render(){
        // promise version for reference
        //  this.renderWrapper()
        //     .then(()=>{
        //         this.renderList();  
        //     })
        
        await this.renderWrapper();
        await this.renderList();
    }

    async renderWrapper()
    {
        this.$wrapperContainer.empty();
        if (!this.wrapperTemplateHtml.length>0){
            this.wrapperTemplateHtml =  await this.getFileContents(this.wrapperTemplateUrl);
        }
        this.$wrapperContainer.html(ejs.render(this.wrapperTemplateHtml, { view: this.viewModel }));

        //bind events for Search, ClearSearch and ResetView 
        await this.bindWrapperEvents();
    }
    async renderList()
    {
        this.$listContainer.empty();
        this.data =  await this.storage.list();
 
        if (!this.listTemplateHtml.length>0){
            this.listTemplateHtml =  await this.getFileContents(this.listTemplateUrl);
        }
        this.$listContainer.html(ejs.render(this.listTemplateHtml, { view:this, data:this.data }));
        
        this.$headerIcon.show();    //show header icon for current sort col and direction (see getter)
      
        this.bindListEvents(this.data);
    }
    
    bindListEvents(data)
    {
        let that = this;
        for(let col of this.columns){
          $(`th[data-name='${col.name}']`).off("click").on("click", (e)=>{
            const dataName = $(e.currentTarget).attr("data-name");
            let curDirection = this.storage.sortDir;
            $(`#${dataName}-${curDirection}`).hide();
            
            if(that.storage.sortCol===dataName){
              that.storage.sortDir = (curDirection =="asc"?"desc":"asc");
            }else{
              that.storage.sortDir ="asc";
            }
            $(`#${dataName}-${this.storage.sortDir}`).show();
            that.storage.sortCol = dataName;
            that.renderList();
          })
        }
        //TODO, setup click handlers for the columns for sorting ascending and descending
        //see the th below and you will see that each th has a 'data-name' attribute.  
        //Each '<i>' tag has an id made up of a sort col and sort direction, separated by a dash.  That's how we easily target the current icon for display
            // <th class="thead sortable bg-black bg-gradient" data-name="name"> Team Name 
            //     <i id="name-asc" class="fa fa-arrow-up" aria-hidden="true" style="display:none"></i> 
            //     <i id="name-desc" class="fa fa-arrow-down" aria-hidden="true" style="display:none"></i>
        //</th>
        //the click handler for each column should determine the correct sortCol and sortDir and then set the sortCol on the storage instance
        //use jquery show/hide to hide or show the correct <i> tag above based on the current sortCol and sortDir in the storage instance
        //then call renderList() when done
       
        //initialize your popover code
        this.initPopover();
    }
    async bindWrapperEvents(){
        //TODO
        //Setup and attach events for your Modal (see https://replit.com/@kjenson/Bootstrap-Modal-Confirmation-Example#index.html) for similar example
        let that=this;
        let $myModal = this.$modal;

        //set up 'show.bs.modal' event as shown in video.  Try not to watch the video unless completely stumped.
        //Note that I store an attribute 'data-id' on each TR so when they click on a delete icon I can grab the id of the element from this attribute.
        //I like to use the jQuery function 'closest' to walk back up the dom to find the TR.
        //I use that.list.nameCol to get the column I need to display the name of the item being deleted
        //I store the data-id and data-name as attributes on myModal element to use in the yesButton click event

        $myModal.on("show.bs.modal", function(ev){  
          let button = ev.relatedTarget
          let rowItemId = $(button).closest("tr").attr(`data-id`);

          let dataItem = that.data[that.storage.getItemIndex(rowItemId)];
          let dataName = dataItem[that.list.nameCol];

          var $modalTitle = $('.modal-title')

          $modalTitle.text(`Delete ${dataName}?`);

          $myModal.attr("data-id", rowItemId);
          $myModal.attr("data-name", dataName);
        });

        $("#yesButton").click((e) =>{    //fired when 'Yes' button is clicked
            let itemName=$myModal.attr("data-name");    //get item name and id from modal attribute set in show.bs.modal event
            let itemId = $myModal.attr("data-id");

            this.addAlert(this.view.entitySingle, itemName);   //insert an alert in 'alertContainer'
            this.deleteListItem(itemId).then((out) => {
                this.renderList();
            }).catch((e) => {
              console.error(e);
            })
            //TODO, call deleteListItem using Promise pattern.  When promise fulfilled, call renderList
           
            
        })
        
        
        //'#resetView' button
        //'#searchInput button   NOTE: use the event called 'input' to trigger your search / REQUIRED
        //    this should grab the search value,  set this.storage.filterStr and re-render the list
        //'#clearSearch' button, this should clear search input, clear this.storage.filterStr, and rerender the list
        //IMPORTANT:  Since we rerender the list when we 'reset' you need to make sure that you turn off previously attached events
        //e.g.,   $('#resetView').off("click");
        $('#resetView').on("click", (e) => {
            this.reset();
        });
        $('#searchInput').on("input", (e) => {
                        
            this.searchVal = $(e.target).val();
            this.runSearch();
        });
        
       // console.log("searchInput Event created");
        $('#clearSearch').off("click").on("click", (e) => {
            $('#searchInput').val("");
            this.storage.filterStr = "";
            this.renderList();
        });
    }
  
    addAlert( itemType, itemName){
        let alertHtml=`<div id="deleteAlert" class="alert alert-warning alert-dismissible fade show" role="alert">
                            <strong>You deleted the following ${itemType}: ${itemName}</span>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
        this.$alertContainer.html(alertHtml);
    }
    runSearch(){
        clearTimeout(this.searchWaiter);
        this.searchWaiter = setTimeout(() => {
            if (this.searchVal.length > 1) {
              this.storage.filterStr = this.searchVal;
              this.storage.filterCol=this.storage.sortCol;
              this.renderList();
           
            } 
        }, 250);
    }
    async deleteListItem(id)
    {
        await this.storage.delete(id);
        await this.renderList();
    }
    initPopover(){
        //integrate your popover code.  You can use mine below for reference.
      let that=this;
      $('[data-bs-toggle="popover"]').popover({
        html: true,
        trigger : 'hover',
        title : function(){
            var index = $(this).attr("data-id");      //get data-id from current TR
            let item= that.data[that.storage.getItemIndex(index)];    //grab the current object from your data
            //return image using the image path in the logoCol (from view model) attribute on the data, output name using nameCol
            return `<img class="img-fluid rounded-circle" src="${item[that.view.list.logoCol]}" width="40" height="40">  ${item[that.view.list.nameCol]} `;
        },
        content : function() {
          var index = $(this).attr("data-id");
          let item= that.data[that.storage.getItemIndex(index)];
          let htmlContent="";
          //using the 'columns' array in the view model, output the column data where popover=true
          that.columns.forEach((col, idx)=>{
            if (col.popover)
              htmlContent+=`<p>${col.label}: ${item[col.name]}</p>`;
          })
          return htmlContent;
        }
    });
    }
     async getFileContents(url){
        return await $.get(url);
        
     }
}