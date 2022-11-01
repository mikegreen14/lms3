
import View from './view.js'
import FormView from './form_view.js';

export default class ListView extends View {
    constructor(storageService, viewModel) {
        super(storageService, viewModel["list"])
        this.entityViewModel = viewModel;
        

    }
    /* GETTERS AND SETTERS */
    get columns() {
        return this.viewModel.columns;
    } //get columns needed for table
    get $searchInput() {
        return $("#" + this.viewModel.searchInputId);
    }

    get $clearSearchButton() {
        return $("#" + this.viewModel.clearSearchButtonId);
    }
    get $newButton() {
        return $("#" + this.viewModel.newButtonId);
    }
    get $resetButton() {
        return $("#" + this.viewModel.resetButtonId);
    }
    get $deleteModal() {
        return $("#" + this.viewModel.deleteModalContainerId);
    }
    get $editModal() {
        return $("#" + this.viewModel.editModalContainerId);
    }
    get $headerIcon() {
        return $(`#${this.storage.sortCol}-${this.storage.sortDir}`)
    }
    get popoversEnabled() {
        return this.viewModel.enablePopovers
    }
    get formView() {return this._formView;}
    get entityName(){
        let str=this.entityViewModel.entitySingle;
        
        return str[0].toUpperCase()+ str.substring(1);
    }
    /* getViewData-overrides parent method */
    async getViewData() { //override
        return await this.storage.list();
    }

    /*editItem(itemId)-Instantiate form view to edit current item*/
    async editItem(itemId) {
        console.log("editItem-"+itemId)
        this._formView = new FormView(this.storage,this.entityViewModel, this)
        this._formView.currentItemId=itemId;
        await this._formView.render();
    }

    /*createItem()-create new item.  Pass in null for id*/
    async createItem() {
       this.editItem(null);
    }

    /*bindItemEvents()-bind edit and sort column events. Initialize sort and popover*/
    async bindItemEvents(data) {
        let that = this;

        $(".editAction").off("click").on("click", function(e) {
            
            let rowItemId = $(this).closest("tr").attr('data-id');

            that.editItem(rowItemId);
        });

        for (let col of this.columns) {
            $(`th[data-name='${col.name}']`).off("click").on("click", (e) => {
                const dataName = $(e.currentTarget).attr('data-name');
                let curDirection = this.storage.sortDir;

                if (that.storage.sortCol === dataName) {
                    that.storage.sortDir = (curDirection == "asc" ? "dsc" : "asc");
                } else {
                    that.storage.sortDir = 'asc';
                }
              
                that.storage.sortCol = dataName;
                that.renderItem();
            });
        };
        //show current sort icon
        that.showSortIcon(that.storage.sortCol, that.storage.sortDir);
     
        if (this.popoversEnabled) {
            this.initPopover();
        }
    }

    /*bindWrapperEvents()-Bind reset, delete and search events */
    async bindWrapperEvents() {

        //Setup and attach events for your Modal (see https://replit.com/@kjenson/Bootstrap-Modal-Confirmation-Example#index.html) for similar example
        let that = this;
        let $deleteModal = this.$deleteModal;
       
        //bind 'new' button
        this.$newButton.click(function(e){
            that.createItem()
        });

        //bind show event for delete confirmation
        $deleteModal.on("show.bs.modal", function (ev) { //fired when modal is about to be shown

            let button = ev.relatedTarget
            let rowItemId = $(button).closest("tr").attr('data-id');

            let dataItem = that.readCachedItem(rowItemId);
            let dataName = dataItem[that.viewModel.nameCol]; //get item display name

            var $modalTitle = $('.modal-title')

            $modalTitle.text(`Delete ${dataName}?`);

            $deleteModal.attr("data-id", rowItemId);
            $deleteModal.attr("data-name", dataName);
        });

        //bind yesButton click for delete modal, render the alert
        //delete the item from storage and then call renderItem
        $("#yesButton").click((e) => { //fired when 'Yes' button is clicked
            let itemName = $deleteModal.attr("data-name"); //get item name and id from modal attribute set in show.bs.modal event
            let itemId = $deleteModal.attr("data-id");

            this.renderAlert(this.storage.entitySingle, itemName); //insert an alert in 'alertContainer'

            //call deleteListItem using Promise pattern.  When promise fulfilled, call renderList
            this.storage.delete(itemId).then((out) => {

                this.renderItem();
            }).catch((e) => {
                console.error(e);
            });
        })

        //bind 'reset' button
        $('#resetView').on("click", (e) => {
            this.reset();
        });
        
        //bind search input 'input' event
        this.$searchInput.on("input", (e) => {

            this.searchVal = $(e.target).val();
            if (this.searchVal.length) {
                this.runSearch();
            } else {
                this.clearSearch();
            }

        });
        //bind clearSearchButton
        this.$clearSearchButton.on("click", (e) => {
            this.clearSearch();
        });
    }
 /*TODO ---NEW----Paging Implementation
    Add any methods you need to support paging in your list.
    You will need to have a dropdown that selects the number of items per page.
    You will need to  have a control which displays the page number and allows you
    to navigate forwards and backwards through the pages.
    The event handlers you create will:
    a. set the 
    
    */
    /*closeEditModal-close the edit modal,called by form*/
    closeEditModal(){
        this.$editModal.modal("hide")
    }

    /*clearSearch-clear search input and storage filter, re-render*/
    clearSearch() {
        this.clearSearchInput();
        this.storage.filterStr = "";
        this.renderItem();
    }
    clearSearchInput() {
        this.$searchInput.val("");
    }

     /*runSearch-run search on 250 ms timeout, set storage filter and render*/
    runSearch() {
        clearTimeout(this.searchWaiter);
        this.searchWaiter = setTimeout(() => {
            if (this.searchVal.length > 1) {
                this.storage.filterStr = this.searchVal;
                this.storage.filterCol = this.storage.sortCol;
                this.renderItem();

            }
        }, 250);
    }

    /*renderAlert-render deletion alert (could make generic)*/
    renderAlert(itemType, itemName) {
        let alertHtml = `<div id="deleteAlert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                <strong>You deleted the following ${itemType}: ${itemName}</span>
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`;
        this.$alertContainer.html(alertHtml);
    }

    /*renderPopoverTitle-render popover title*/
    renderPopoverTitle(item) {
            return item[this.viewModel.nameCol];
        //return `<img class="img-fluid rounded-circle" src="${item[this.viewModel.logoCol]}" width="40" height="40">  ${item[this.viewModel.nameCol]} `;
    }
    /*renderPopoverBody-render popover body*/
    renderPopoverBody(item) {
        let htmlContent = "";
        this.columns.forEach((col, idx) => {
            if (col.popover)
                htmlContent += `<p>${col.label}: ${item[col.name]}</p>`;
        })
        return htmlContent;
    }
    /*initPopover-initialize popover*/
    initPopover() {
        let that = this;
        $('[data-bs-toggle="popover"]').popover({
            html: true,
            trigger: 'hover',
            delay: {
                show: 600,
                hide: 200
            },
            placement: 'auto',
            title: function () {
                var index = $(this).closest("tr").attr("data-id");
                let item = that.readCachedItem(index);
                return that.renderPopoverTitle(item);

            },
            content: function () {
                var index = $(this).closest("tr").attr("data-id");
                let item = that.readCachedItem(index);
                return that.renderPopoverBody(item); //it is view's job to render html content

            }
        });
    }
    /*hideSortIcons-hide the sort up and down arrows*/
    hideSortIcons() {
        $(".toggleIcon").hide();
    }
     /*showSortIcon/hideSortIcon-hide/show the sort up and down arrows given col and direction*/
    showSortIcon(col, dir) {
        $(`#${col}-${dir}`).show();
    }
    hideSortIcon(col, dir) {
        $(`#${col}-${dir}`).hide();
    }
    




}