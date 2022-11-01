import View from './view.js'

export default class FormView extends View {
  constructor(storageService, viewModel, parentView) {
    super(storageService, viewModel["form"])
    this.entityViewModel = viewModel;
    this.currentItemId = null;

    this.parentView = parentView; //reference to parent list view
    this.formChanged = false; //tracks if form changed
  }
  /* GETTERS AND SETTERS */
  get fields() {
    return this.viewModel.fields
  }
  get formId() {
    return this.viewModel.id;
  }
  get $form() {
    return $("#" + this.formId);
  }
  get form() {
    return this.$form.get(0);
  }
  get formValid() {
    return this.form.checkValidity();
  }
  get $inputs() {
    return $("#" + this.formId + " :input");
  }
  

  /* getViewData-overrides parent method */
  async getViewData() {
    if (this.currentItemId)
      return await this.storage.read(this.currentItemId);
    else
      return {}; //return empty object for 'create' action
  }

  /*bindItemEvents()-override-bind form submit and cancel events*/
  async bindItemEvents(data) {

    this.$form.submit(this.submit);

    $("#cancelButton").click(e => {

      if (!this.formChanged || confirm("Form changed! Are you sure you want to exit?")) {
        this.parentView.closeEditModal();
      }
    });
    this.$inputs.change(this.change); //set up on change

    //set form action
    this.$form.attr('action', this.formAction);
    this.$form.attr('method', this.method);
  }
  async bindWrapperEvents() {}

  submit = ev => {
    //prevent form submit from happening, we will handle
    ev.preventDefault();
    ev.stopPropagation();

    //this.validateForm();  //not doing custom validation yet
    let valid = this.form.checkValidity();

    this.formValidated();   //place .was-validated class on form

    if (valid) {
      let submitObj = this.getFormData();  //grab data from form

      if (this.currentItemId != null) {

        this.storage.update(this.currentItemId, submitObj).then(() => {
          this.parentView.renderItem();

        }).catch((e) => {
          alert("Something went wrong updating the form");
          console.error(e);
        });
      } else {
        this.storage.create(submitObj).then(() => {
          
          this.parentView.renderItem();
        }).catch((e) => {
          alert("Something went wrong updating the form", true);
          console.error(e);
        });
      }
      this.parentView.closeEditModal();  //have parent view close modal
    }

  }

  /*getFormData()-get the data from the form an package as a normal object for submit*/
  getFormData() {
    return Object.fromEntries(new FormData(this.form));
    //reference: https://gomakethings.com/serializing-form-data-with-the-vanilla-js-formdata-object/

  }

  /*change()-change event handler for inputs.  call fieldValidated to set the bootstrap classes. Set formChanged*/
  change = ev => {
    let $el = this.getEventEl(ev);
    this.fieldValidated($el);
    this.formChanged = true;
  }

  /*getEventEl(ev)-get jquery wrapped element for event*/
  getEventEl(ev) {
    return $(ev.currentTarget);
  }

  /*fieldValidated($el)-remove validity classes and apply class for current state */
  fieldValidated($el) {
    $el.removeClass("is-valid").removeClass("is-invalid")
    $el.addClass($el.is(":valid") ? 'is-valid' : 'is-invalid');
  }

  /*formValidated()-simply add was-validated class to form*/
  formValidated() {
    this.$form.addClass("was-validated");
  }

}