export default class Listeners {
  constructor(elements, helpers) {
    this.elements = elements;
    this.helpers = helpers;
    this.#bindListeners();
  }

  #bindListeners() {
    let current = this;
    this.elements.confirmDelete.addEventListener('click', this.#confirmDeleteListener.bind(this));
    this.elements.submission.addEventListener('submit', this.#submissionListener.bind(this));
    this.elements.updateForm.addEventListener('submit', this.#updateFormListener.bind(this));
    this.#fillform();
    this.elements.nameElement.addEventListener('keyup', this.#handleSearchChangeListener.bind(this));
    this.elements.searchTags.addEventListener('change', this.#handleSearchChangeListener.bind(this));
    document.querySelectorAll('.addContact').forEach(el => {
      el.addEventListener('click', this.#addContactListener.bind(this));
    });
    document.getElementById('cancel').addEventListener('click', this.#cancelListener.bind(this));
    document.getElementById('edit_cancel').addEventListener('click', this.#editCancelListener.bind(this));
    document.querySelectorAll('.twoTags').forEach(function(el) {
      el.addEventListener('change', current.#twoTagsListener);
    });
    document.getElementById('clearFilters').addEventListener('click', this.#clearFiltersListener.bind(this));
    this.elements.cancelDelete.addEventListener('click', () => {
      this.elements.modal.style.display = 'none';
    });
  }

  #fillform() {
    this.fillFormRequest = new XMLHttpRequest();
    this.fillFormRequest.open('GET', 'http://localhost:3000/api/contacts');
    this.fillFormRequest.responseType = 'json';
    this.fillFormRequest.addEventListener('load', this.#requestFillFormListener.bind(this));
    this.#requestError(this.fillFormRequest);
    this.fillFormRequest.send();
  }

  #addList() {
    let buttons = document.querySelector('#contact-handle');
    buttons.addEventListener('click', this.#addListListener.bind(this));
  }

  #addListListener(event) {
    if (event.target.hasAttribute('data-delete')) {
      this.elements.modal.style.display = 'block';
      this.helpers.currentButton = event.target;
    } else if (event.target.hasAttribute('data-edit')) {
      this.helpers.addHide("updateForm");
      let parent = event.target.parentElement;
      let id = parent.id;
      document.getElementById("edit_full_Name").value = parent.children[0].textContent;
      document.getElementById("edit_phone_number").value = parent.children[2].textContent;
      document.getElementById("edit_email").value = parent.children[4].textContent;
      let tagsArr = parent.children[6].textContent.split(',');
      if (tagsArr.length < 2) tagsArr.push('');
      Array.prototype.slice.call(document.getElementById("updateTags1").children).forEach(el => this.helpers.setTags(el, 0, tagsArr));
      Array.prototype.slice.call(document.getElementById("updateTags2").children).forEach(el => this.helpers.setTags(el, 1, tagsArr));
      let changeEvent = new Event('change', { bubbles: true });
      document.getElementById("updateTags1").dispatchEvent(changeEvent);
      this.elements.updateForm.setAttribute('data-id', id);
    }
  }

  #confirmDeleteListener() {
    this.deleteRequest = new XMLHttpRequest();
    let id = this.helpers.currentButton.parentElement.id;
    this.deleteRequest.open('DELETE', `http://localhost:3000/api/contacts/${id}`);
    this.helpers.resetFilterValues();
    this.deleteRequest.addEventListener('load', this.#requestDeleteListener.bind(this));
    this.#requestError(this.deleteRequest);
    this.deleteRequest.send();
    this.helpers.currentButton.parentElement.remove();
    this.elements.modal.style.display = 'none';
    this.#fillform();
  }

  #requestDeleteListener() {
    if (this.deleteRequest.status === 204) {
      let parent = this.helpers.currentButton.parentElement;
      let deletedName = parent.firstElementChild.textContent;
      this.helpers.showMessage();
      this.elements.newMessage.textContent = `${deletedName} was deleted!`;
    } else {
      console.error(`Delete failed with status ${this.fillFormRequest.status}: ${this.fillFormRequest.statusText}`);
    }
  }

  #requestFillFormListener() {
    if (this.fillFormRequest.status === 200) {
      this.elements.contactAdd.style.display = (this.fillFormRequest.response.length === 0) ? 'block' : 'none';
      this.elements.searchForm.forEach(el => {
        el.style.display = (this.fillFormRequest.response.length === 0) ? 'none' : 'block';
      });
      this.#fillContacts(this.fillFormRequest.response);
    } else {
      console.error(`Loading contacts failed with status ${this.fillFormRequest.status}: ${this.fillFormRequest.statusText}`);
    }
  }

  #requestError(request) {
    request.addEventListener('error', () => console.log('An error occured while deleting.'));
  }

  #submitListener(request, obj, type, name) {
    request.addEventListener('load', () => {
      if (request.status === 201) {
        this.#fillform();
        this.helpers.hideForm();
        document.getElementById('updateForm').style.display = 'none';
        this.helpers.showMessage();
        this.elements.newMessage.textContent = (type === 'submit') ? `${name} was added!` : `${name} was updated!`;
      } else {
        console.error(`Request failed with status ${request.status}: ${request.statusText}`);
      }
    });
    this.#requestError(request);
    request.send(JSON.stringify(obj));
  }

  #submissionListener(event) {
    event.preventDefault();
    let formData = new FormData(this.elements.submission);
    let obj = {};

    this.helpers.formatFormData(obj, formData);
    this.helpers.getTags(obj, 'tags1', 'tags2');
    this.helpers.validate(obj, 'nameError', 'emailError', 'phoneError');

    if (this.elements.error.every(err => err.style.display === 'none')) {
      let request = new XMLHttpRequest();
      request.open("POST", 'http://localhost:3000/api/contacts/');
      request.setRequestHeader('Content-Type', 'application/json');

      this.#submitListener(request, obj, 'submit', obj.full_name);
    }
  }

  #updateFormListener(event) {
    event.preventDefault();
    let updateEl = document.querySelector("#update");
    let formData = new FormData(updateEl);
    let obj = {};

    this.helpers.formatFormData(obj, formData);

    if (obj.updateTags1 === obj.updateTags2) delete obj.updateTags2;
    this.helpers.getTags(obj, 'updateTags1', 'updateTags2');
    this.helpers.validate(obj, 'edit_nameError', 'edit_emailError', 'edit_phoneError');

    if (this.elements.error.every(err => err.style.display === 'none')) {
      updateEl.reset();
      let starter = this.elements.updateForm.getAttribute('data-id');
      let request = new XMLHttpRequest();
      request.open('PUT', `http://localhost:3000/api/contacts/${starter}`);
      request.setRequestHeader('Content-Type', 'application/json');

      this.#submitListener(request, obj, 'update', obj.full_name);
    }
  }

  #editCancelListener() {
    this.helpers.hideForm();
    document.getElementById('clearFilters').dispatchEvent(new Event('click'));
    document.getElementById('updateForm').style.display = 'none';
  }

  #clearFiltersListener() {
    this.helpers.resetFilterValues();
    document.getElementById("updateTags1").dispatchEvent(new Event('change'));
    this.elements.nameElement.dispatchEvent(new Event('keyup'));
  }

  #twoTagsListener() {
    let [tag1, tag2] = [this.children[1], this.children[3]];
    let [t1, t2, tagOne, tagTwo] = [tag1.id, tag2.id, tag1.value, tag2.value];

    function hideTags(initial, compare) {
      let initChild = document.getElementById(initial).children;
      let arr = Array.prototype.slice.call(initChild);
      arr.forEach(option => {
        option.style.display = (option.value === compare && compare !== '') ? 'none' : 'block';
      });
    }

    hideTags(t1, tagTwo);
    hideTags(t2, tagOne);
  }

  #cancelListener() {
    this.helpers.clearErrors();
    this.#fillform();
    this.helpers.hideForm();
  }

  #addContactListener() {
    this.helpers.clearErrors();
    this.helpers.addHide("submissionForm");
    this.elements.submission.reset();
  }

  #handleSearchChangeListener() {
    this.helpers.deleteMessage();
    this.elements.newMessage.textContent = '';
    let searchName = document.querySelector('#name').value.trim().toLowerCase();
    let searchTag = this.elements.searchTags.value;

    document.querySelectorAll('.tags').forEach(tag => {
      if (tag.textContent.includes(searchTag)) {
        tag.closest('ul').style.display = 'block';
      } else {
        tag.closest('ul').style.display = 'none';
      }
    });

    document.querySelectorAll('.nameClass').forEach(name => {
      let nameArr = name.textContent.toLowerCase().trim().split(/\s+/);
      let bool = nameArr.some(el => {
        return (el.startsWith(searchName) || nameArr.join('').startsWith(searchName.replace(/\s+/, '')));
      });

      if (!bool) {
        name.closest('ul').style.display = 'none';
      }
    });
    if (searchName && !searchTag) {
      this.helpers.notification(searchName, searchTag, `starting with ${searchName}`);
    } else {
      this.helpers.notification(searchName, searchTag, `with the Tag: ${searchTag}`);
    }
  }

  #fillContacts(response) {
    response.forEach(el => {
      el.phone_number = this.helpers.format(el.phone_number);
    });
    let templateSource = document.getElementById("contacts").innerHTML;
    let template = Handlebars.compile(templateSource);
    let compiledHtml = template(response);
    document.getElementById("contacts-list").innerHTML = compiledHtml;
    if (this.helpers.bool) {
      this.helpers.bool = false;
      this.#addList();
    }
  }
}