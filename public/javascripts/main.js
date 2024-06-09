document.addEventListener('DOMContentLoaded', () => {

  let modal = document.getElementById('myModal');
  let confirmDelete = document.getElementById('confirmDelete');
  let cancelDelete = document.getElementById('cancelDelete');
  let contactAdd = document.getElementById('contact-add');
  let nameElement = document.getElementById('name');
  let newMessage = document.getElementById('message');
  let noContacts = document.getElementById('noContacts');
  let updateForm = document.querySelector("#updateForm");
  let searchTags = document.getElementById('searchTags');
  let error = Array.prototype.slice.call(document.querySelectorAll('.error'));
  let searchForm = Array.prototype.slice.call(document.querySelectorAll('.addForm'));
  let submission = document.querySelector("#submission");
  let currentButton;
  let bool = true;

  //EVENT LISTENER CALLBACKS
  function handleSearchChangeListener() {
    deleteMessage();
    newMessage.textContent = '';
    let searchName = document.querySelector('#name').value.trim().toLowerCase();
    let searchTag = searchTags.value;

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

    notification(searchName, searchTag, `with the Tag: ${searchTag}`);
  }

  function addListListener(event) {
    if (event.target.hasAttribute('data-delete')) {
      modal.style.display = 'block';
      currentButton = event.target;
    } else if (event.target.hasAttribute('data-edit')) {
      addHide("updateForm");
      let parent = event.target.parentElement;
      let id = parent.id;
      document.getElementById("edit_full_Name").value = parent.children[0].textContent;
      document.getElementById("edit_phone_number").value = parent.children[2].textContent;
      document.getElementById("edit_email").value = parent.children[4].textContent;
      let tagsArr = parent.children[6].textContent.split(',');
      if (tagsArr.length < 2) tagsArr.push('');
      Array.prototype.slice.call(document.getElementById("updateTags1").children).forEach(el => setTags(el, 0, tagsArr));
      Array.prototype.slice.call(document.getElementById("updateTags2").children).forEach(el => setTags(el, 1, tagsArr));
      let changeEvent = new Event('change', { bubbles: true });
      document.getElementById("updateTags1").dispatchEvent(changeEvent);
      updateForm.setAttribute('data-id', id);
    }
  }

  function editCancelListener() {
    hideForm();
    document.getElementById('clearFilters').dispatchEvent(new Event('click'));
    document.getElementById('updateForm').style.display = 'none';
  }

  function clearFiltersListener() {
    resetFilterValues();
    document.getElementById("updateTags1").dispatchEvent(new Event('change'));
    nameElement.dispatchEvent(new Event('keyup'));
  }

  function twoTagsListener() {
    let [tag1, tag2] = [this.children[1], this.children[3]];
    let [t1, t2, tagOne, tagTwo] = [tag1.id, tag2.id, tag1.value, tag2.value];
    hideTags(t1, tagTwo);
    hideTags(t2, tagOne);
  }

  function cancelListener() {
    clearErrors();
    fillform();
    hideForm();
  }

  function requestFillFormListener() {
    if (this.status === 200) {
      contactAdd.style.display = (this.response.length === 0) ? 'block' : 'none';
      searchForm.forEach(el => {
        el.style.display = (this.response.length === 0) ? 'none' : 'block';
      });
      fillContacts(this.response);
    } else {
      console.error(`Loading contacts failed with status ${this.status}: ${this.statusText}`);
    }
  }

  function updateFormListener(event) {
    event.preventDefault();
    let updateEl = document.querySelector("#update");
    let formData = new FormData(updateEl);
    let obj = {};

    formatFormData(obj, formData);

    if (obj.updateTags1 === obj.updateTags2) delete obj.updateTags2;
    getTags(obj, 'updateTags1', 'updateTags2');
    validate(obj, 'edit_nameError', 'edit_emailError', 'edit_phoneError');

    if (error.every(err => err.style.display === 'none')) {
      updateEl.reset();
      let starter = updateForm.getAttribute('data-id');
      let request = new XMLHttpRequest();
      request.open('PUT', `http://localhost:3000/api/contacts/${starter}`);
      request.setRequestHeader('Content-Type', 'application/json');

      submitListener(request, obj, 'update', obj.full_name);
    }
  }

  function addContactListener() {
    clearErrors();
    addHide("submissionForm");
    submission.reset();
  }

  function requestDeleteListener() {
    if (this.status === 204) {
      let parent = currentButton.parentElement;
      let deletedName = parent.firstElementChild.textContent;
      showMessage();
      newMessage.textContent = `${deletedName} was deleted!`;
    } else {
      console.error(`Delete failed with status ${this.status}: ${this.statusText}`);
    }
  }


  //XML REQUESTS
  function confirmDeleteListener() {
    let request = new XMLHttpRequest();
    let id = currentButton.parentElement.id;
    request.open('DELETE', `http://localhost:3000/api/contacts/${id}`);
    resetFilterValues();
    request.addEventListener('load', requestDeleteListener);
    requestError(request);
    request.send();
    currentButton.parentElement.remove();
    modal.style.display = 'none';
    fillform();
  }

  function submissionListener(event) {
    event.preventDefault();
    let formData = new FormData(submission);
    let obj = {};

    formatFormData(obj, formData);
    getTags(obj, 'tags1', 'tags2');
    validate(obj, 'nameError', 'emailError', 'phoneError');

    if (error.every(err => err.style.display === 'none')) {
      let request = new XMLHttpRequest();
      request.open("POST", 'http://localhost:3000/api/contacts/');
      request.setRequestHeader('Content-Type', 'application/json');

      submitListener(request, obj, 'submit', obj.full_name);
    }
  }

  function fillform() {
    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/api/contacts');
    request.responseType = 'json';
    request.addEventListener('load', requestFillFormListener);
    requestError(request);
    request.send();
  }

  //MISC FUNCTIONS
  function resetFilterValues() {
    nameElement.value = '';
    searchTags.value = '';
  }

  function hideTags(initial, compare) {
    let initChild = document.getElementById(initial).children;
    let arr = Array.prototype.slice.call(initChild);
    arr.forEach(option => {
      option.style.display = (option.value === compare && compare !== '') ? 'none' : 'block';
    });
  }

  function formatFormData(obj, formData) {
    for (let entry of formData.entries()) {
      if (entry[0] === 'full_name' && entry[1]) {
        obj[entry[0]] = entry[1].trim().split(/\s+/).map(el => el[0].toUpperCase() + el.slice(1)).join(' ');
      } else if (entry[0] === 'phone_number' && entry[1]) {
        obj[entry[0]] = entry[1].trim();
      } else {
        obj[entry[0]] = entry[1];
      }
    }
  }

  function format(number) {
    if (number.match(/\d{3}-\d{3}-\d{4}/)) {
      return number;
    } else if (number.match(/^\(\d{3}\)\d{3}-\d{4}$/)) {
      return number.replace('(', '').replace(')', '-');
    } else if (number.match(/\d{10}/)) {
      let arr = number.split('');
      arr.splice(3, 0, '-');
      arr.splice(7, 0, '-');
      return arr.join('');
    }
    return number;
  }

  function fillContacts(response) {
    response.forEach(el => {
      el.phone_number = format(el.phone_number);
    });
    let templateSource = document.getElementById("contacts").innerHTML;
    let template = Handlebars.compile(templateSource);
    let compiledHtml = template(response);
    document.getElementById("contacts-list").innerHTML = compiledHtml;
    if (bool) {
      bool = false;
      addList();
    }
  }

  function setTags(element, num, arr) {
    if (element.value === arr[num]) {
      element.setAttribute('selected', 'selected');
    } else {
      element.removeAttribute('selected');
    }
  }

  function showMessage() {
    newMessage.classList.add('show');
  }

  function deleteMessage() {
    newMessage.classList.remove('show');
  }

  function notification(searchName, searchTag, phrase) {
    let search = document.getElementById('search');

    if (Array.prototype.slice.call((document.querySelectorAll('ul'))).every(ul => ul.style.display === 'none')) {
      noContacts.style.display = 'block';
      search.textContent = (searchName.length > 0 && searchTag.length > 0) ? `starting with ${searchName} with the Tag: ${searchTag}` : phrase;
    } else {
      noContacts.style.display = 'none';
    }
    if (searchTag === '' && searchName === '') noContacts.style.display = 'none';
  }

  function getTags(obj, one, two) {
    let tags = null;
    if (obj[one] && !obj[two]) {
      tags = obj[one];
    } else if (obj[two] && !obj[one]) {
      tags = obj[two];
    } else if (obj[one] && obj[two]) {
      tags = obj[one] + ',' + obj[two];
    }
    delete obj[one];
    delete obj[two];
    obj.tags = tags;
  }

  function addHide(form) {
    deleteMessage();
    newMessage.textContent = '';
    searchForm.forEach(el => {
      el.style.display = 'none';
    });
    document.getElementById(form).style.display = 'block';
    document.getElementById("contact-handle").style.display = 'none';
    contactAdd.style.display = 'none';
    noContacts.style.display = 'none';
    resetFilterValues();
  }

  function hideForm() {
    document.getElementById("submissionForm").style.display = 'none';
    searchForm.forEach(el => {
      el.style.display = 'block';
    });
    document.getElementById("contact-handle").style.display = 'block';
  }

  function clearErrors() {
    error.forEach(err => {
      err.style.display = 'none';
    });
    Array.prototype.slice.call(document.getElementsByClassName('errorbox')).forEach(el => el.classList.remove('errorbox'));
  }

  function validate(obj, nameError, emailError, phoneError) {
    validation(obj.full_name, "^[a-zA-Z' -]+$", nameError);
    validation(obj.email, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$", emailError);
    validation(obj.phone_number, "^(\\d{10}|\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\)\\d{3}-\\d{4})$", phoneError);

    function validation(key, regex, id) {
      let el = document.getElementById(id);
      let newRegex = new RegExp(regex);
      if (!key.match(newRegex)) {
        el.style.display = 'block';
        el.previousElementSibling.classList.add('errorbox');
      } else {
        el.style.display = 'none';
        el.previousElementSibling.classList.remove('errorbox');
      }
    }
  }

  fillform();

  //EVENT LISTENERS

  function submitListener(request, obj, type, name) {
    request.addEventListener('load', () => {
      if (request.status === 201) {
        fillform();
        hideForm();
        document.getElementById('updateForm').style.display = 'none';
        showMessage();
        newMessage.textContent = (type === 'submit') ? `${name} was added!` : `${name} was updated!`;
      } else {
        console.error(`Request failed with status ${request.status}: ${request.statusText}`);
      }
    });
    requestError(request);
    request.send(JSON.stringify(obj));
  }

  function addList() {
    let buttons = document.querySelector('#contact-handle');
    buttons.addEventListener('click', addListListener);
  }

  function requestError(request) {
    request.addEventListener('error', () => console.log('An error occured while deleting.'));
  }

  nameElement.addEventListener('keyup', handleSearchChangeListener);
  searchTags.addEventListener('change', handleSearchChangeListener);

  document.querySelectorAll('.addContact').forEach(el => {
    el.addEventListener('click', addContactListener);
  });

  submission.addEventListener('submit', submissionListener);
  updateForm.addEventListener('submit', updateFormListener);
  document.getElementById('cancel').addEventListener('click', cancelListener);
  document.getElementById('edit_cancel').addEventListener('click', editCancelListener);

  document.querySelectorAll('.twoTags').forEach(function(el) {
    el.addEventListener('change', twoTagsListener);
  });

  document.getElementById('clearFilters').addEventListener('click', clearFiltersListener);

  cancelDelete.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  confirmDelete.addEventListener('click', confirmDeleteListener);
});