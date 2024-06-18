export default class Elements {
  constructor() {
    this.modal = document.getElementById('myModal');
    this.confirmDelete = document.getElementById('confirmDelete');
    this.cancelDelete = document.getElementById('cancelDelete');
    this.contactAdd = document.getElementById('contact-add');
    this.nameElement = document.getElementById('name');
    this.newMessage = document.getElementById('message');
    this.noContacts = document.getElementById('noContacts');
    this.updateForm = document.querySelector("#updateForm");
    this.searchTags = document.getElementById('searchTags');
    this.error = Array.prototype.slice.call(document.querySelectorAll('.error'));
    this.searchForm = Array.prototype.slice.call(document.querySelectorAll('.addForm'));
    this.submission = document.querySelector("#submission");
  }
}