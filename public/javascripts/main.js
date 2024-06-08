document.addEventListener('DOMContentLoaded', () => {

  let modal = document.getElementById('myModal');
  let confirmDelete = document.getElementById('confirmDelete');
  let cancelDelete = document.getElementById('cancelDelete');
  let contactAdd = document.getElementById('contact-add')
  let nameElement = document.getElementById('name');
  let newMessage = document.getElementById('message');
  let noContacts = document.getElementById('noContacts');
  let updateForm = document.querySelector("#updateForm");
  let seachTags = document.getElementById('searchTags');
  let error = Array.prototype.slice.call(document.querySelectorAll('.error'));
  let searchForm = Array.prototype.slice.call(document.querySelectorAll('.addForm'));
  let submission = document.querySelector("#submission");
  let currentButton;
  let bool = true;
    
  function hideTags(initial, compare) {
    Array.prototype.slice.call(document.getElementById(initial).children).forEach(option => {
      option.style.display = (option.value === compare && compare !== '') ? 'none' : 'block';
    })
  }

  function requestError(request) {
    request.addEventListener('error', () => {
      console.log('An error occured while deleting.');
    })
  }

  function fillform() {
    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/api/contacts');
    request.responseType = 'json';

    request.addEventListener('load', () => {
      if (request.status === 200) {
        contactAdd.style.display = (request.response.length === 0) ? 'block' : 'none';
        searchForm.forEach(el => el.style.display = (request.response.length === 0) ? 'none' : 'block');
        fillContacts(request.response);
      } else {
        console.error(`Loading contacts failed with status ${request.status}: ${request.statusText}`);
      }
    })

    requestError(request);
    request.send();
  }

  function format(number) {
    if (number.match(/\d{3}-\d{3}-\d{4}/)) {
      return number;
    } else if (number.match(/^\(\d{3}\)\d{3}-\d{4}$/)) {
      return number.replace('(', '').replace(')', '-');
    } else if (number.match(/\d{10}/)){
      let arr = number.split('');
      arr.splice(3, 0, '-');
      arr.splice(7, 0, '-');
      return arr.join('');
    }
    return number;
  }
  
  function fillContacts(response) {
    response.forEach(el => el.phone_number = format(el.phone_number));
    var templateSource = document.getElementById("contacts").innerHTML;
    var template = Handlebars.compile(templateSource);
    var compiledHtml = template(response);
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

  function deleteContact() {
    cancelDelete.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    confirmDelete.addEventListener('click', () => {
      let request = new XMLHttpRequest();
      let id = currentButton.parentElement.id;
      request.open('DELETE', `http://localhost:3000/api/contacts/${id}`);
      nameElement.value = '';
      seachTags.value = '';

      request.addEventListener('load', () => {
        if (request.status === 204) {
          let deletedName = currentButton.parentElement.firstElementChild.textContent;
          showMessage()
          newMessage.textContent = `${deletedName} was deleted!`;
        } else {
          console.error(`Delete failed with status ${request.status}: ${request.statusText}`);
        }
      });

      requestError(request);
      request.send();

      currentButton.parentElement.remove();
      modal.style.display = 'none';
      fillform();
    });
  }

  deleteContact();



  function notification(searchName, searchTag, phrase) {
    let search = document.getElementById('search');

    if (Array.prototype.slice.call((document.querySelectorAll('ul'))).every(ul => ul.style.display === 'none')) {
      noContacts.style.display ='block';
      search.textContent = (searchName.length > 0 && searchTag.length> 0) ? `starting with ${searchName} with the Tag: ${searchTag}` : phrase;
    } else {
      noContacts.style.display ='none';
    }
    if (searchTag === '' && searchName === '') noContacts.style.display ='none';
  }

  function addList() {
    let buttons = document.querySelector('#contact-handle');

    buttons.addEventListener('click', event => {
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
        
        updateForm.setAttribute('data-id', id);
      }
    })
  }

  function getTags(obj, one, two) {
    let tags = null
    if (obj[one] && !obj[two]) {
      tags = obj[one];
    } else if (obj[two] && !obj[one]) {
      tags = obj[two];
    } else if (obj[one] && obj[two]) {
      tags = obj[one] + ',' + obj[two];
    } 
    delete obj[one], obj[two];
    obj.tags = tags;
  }

  function addHide(form) {
    deleteMessage()
    newMessage.textContent = '';
    searchForm.forEach(el => el.style.display='none');
    document.getElementById(form).style.display='block';
    document.getElementById("contact-handle").style.display='none';
    contactAdd.style.display='none';
    noContacts.style.display='none';
    nameElement.value = '';
    seachTags.value = '';
  }

  function hideForm() {
    document.getElementById("submissionForm").style.display='none';
    searchForm.forEach(el => el.style.display='block');
    document.getElementById("contact-handle").style.display='block';
  }
  
  function clearErrors() {
    error.every(err => err.style.display = 'none');
    Array.prototype.slice.call(document.getElementsByClassName('errorbox')).forEach(el => el.classList.remove('errorbox'));  
  }

  function validate(obj, nameError, emailError, phoneError) {
    validation(obj.full_name, "^[a-zA-Z' -]+$", nameError);
    validation(obj.email, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$", emailError);
    validation(obj.phone_number, "^(\\d{10}|\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\)\\d{3}-\\d{4})$", phoneError);
    
    function validation(key, regex, id) {
      let el = document.getElementById(id)
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

  function submitListener(request, obj, type, name) {
    request.addEventListener('load', () => {
      if (request.status === 201) {
        fillform();
        hideForm();
        document.getElementById('updateForm').style.display='none';
        showMessage()
        newMessage.textContent = (type === 'submit') ? `${name} was added!` : `${name} was updated!`;
      } else {
        console.error(`Request failed with status ${request.status}: ${request.statusText}`);
      }
    })

    requestError(request);
    request.send(JSON.stringify(obj));
  }

  fillform();

  nameElement.addEventListener('keyup', function() {
    deleteMessage()
    newMessage.textContent = '';
    let searchName = this.value;
    let searchTag = seachTags.value;

    document.querySelectorAll('.nameClass').forEach(name => {
      if (name.textContent.toLowerCase().startsWith(searchName.toLowerCase())) {
        name.closest('ul').style.display = 'block';

        document.querySelectorAll('.tags').forEach(tag => {
          if (!tag.textContent.includes(searchTag)) tag.closest('ul').style.display = 'none';
        })

      } else {
        name.closest('ul').style.display = 'none';
      }
    })
    notification(searchName, searchTag, `starting with ${searchName}`);
  })


  seachTags.addEventListener('change', event => {
    deleteMessage()
    newMessage.textContent = '';
    let searchName = document.querySelector('#name').value;
    let searchTag = event.target.value;

    document.querySelectorAll('.tags').forEach(tag => {
      if (tag.textContent.includes(searchTag)) {
        tag.closest('ul').style.display = 'block';

        document.querySelectorAll('.nameClass').forEach(name => {
          if (!name.textContent.toLowerCase().startsWith(searchName.toLowerCase())) name.closest('ul').style.display = 'none';
        })
      } else {
        tag.closest('ul').style.display = 'none';
      }
    })
    notification(searchName, searchTag, `with the Tag: ${searchTag}`);
  })


  document.querySelectorAll('.addContact').forEach(el => {
    el.addEventListener('click', () => {
      clearErrors();
      addHide("submissionForm");
      submission.reset();
    })
  })

  
  submission.addEventListener('submit', event => {
    event.preventDefault();

    let formData = new FormData(submission);
    let obj = {};

    for (let entry of formData.entries()) {
      obj[entry[0]] = (entry[0] === 'full_name' && entry[1]) ? entry[1].split(' ').map(el => el[0].toUpperCase() + el.slice(1)).join(' ') : entry[1];
    }
    getTags(obj, 'tags1', 'tags2');

    validate(obj, 'nameError', 'emailError', 'phoneError');

    if (error.every(err => err.style.display === 'none')) {
      let request = new XMLHttpRequest();
      request.open("POST", 'http://localhost:3000/api/contacts/');
      request.setRequestHeader('Content-Type', 'application/json');

      submitListener(request, obj, 'submit', obj.full_name);
    }
  })

  
  updateForm.addEventListener('submit', event => {
    event.preventDefault();
    let updateEl = document.querySelector("#update")
    let formData = new FormData(updateEl);
    let obj = {};

    for (let entry of formData.entries()) {
      obj[entry[0]] = (entry[0] === 'full_name' && entry[1]) ? entry[1].split(' ').map(el => el[0].toUpperCase() + el.slice(1)).join(' ') : entry[1];
    }
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
  })


  document.getElementById('cancel').addEventListener('click', () => {
    clearErrors();
    fillform();
    hideForm();
  })


  document.getElementById('edit_cancel').addEventListener('click', () => {
    hideForm();
    document.getElementById('updateForm').style.display='none';
  })
  

  document.querySelectorAll('.twoTags').forEach(el => {
    el.addEventListener('change', () => {
      let [tag1, tag2] = [el.children[1],el.children[3]];
      let [tags1, tags2, tagOne, tagTwo] = [tag1.id, tag2.id, tag1.value, tag2.value];

      hideTags(tags1, tagTwo);
      hideTags(tags2, tagOne);
    })
  })

})








