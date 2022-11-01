import View from "./view"

export default class GenericView extends View
{
    constructor(viewModel)
    {
        super(viewModel);
    }
   
    getViewData(){
        return this.viewModel.data;
    }
    
}