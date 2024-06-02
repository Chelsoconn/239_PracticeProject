// import Model from './mods/model.js';
// import View from './mods/view.js';
// import Controller from './mods/controller.js';

$(() => {
  let modal = document.getElementById('myModal');
  let confirmDelete = document.getElementById('confirmDelete');
  let cancelDelete = document.getElementById('cancelDelete');
  let currentButton;
  
  // This is filling the contact list on the main page

  function fillform() {
    let request = new XMLHttpRequest()
    request.open('GET', 'http://localhost:3000/api/contacts')
    request.responseType = 'json'
    request.addEventListener('load', event => {
      if (request.response.length === 0) {
        // This is showing the There Are No Contacts Sign
        document.getElementById('contact-add').style.display='block'
      } else {
        document.getElementById('contact-add').style.display='none'
      }
      fillContacts(request.response)
    })
    request.send()
  }

  // Original fillform

  fillform()
  let bool = true
  
  // This is filling out the HTML template
  function fillContacts(response) {
    var templateSource = document.getElementById("contacts").innerHTML;
    var template = Handlebars.compile(templateSource);
    var compiledHtml = template(response);
    document.getElementById("contacts-list").innerHTML = compiledHtml;
  //  We have to add the delete event listener here bc the button is added after compiled
    if (bool) {
      bool = false
      addList()
    }
  }
  
  // This is adding event listeners to delete and edit 

  function addList() {
    let buttons = document.querySelector('#contact-handle');

    buttons.addEventListener('click', event => {
      if (event.target.hasAttribute('data-delete')) {
        modal.style.display = 'block';
        currentButton = event.target;
      } else if (event.target.hasAttribute('data-edit')) { //fix the edit 
        addHide("updateForm")
        let id = event.target.parentElement.id
        document.querySelector("#updateForm").setAttribute('data-id', id)
      }
    })
  }
  
  // DELETE MODAL FUNCTIONALITY

  (function deleteContact() {
    cancelDelete.onclick = function() {
      modal.style.display = 'none';
    }
  
    confirmDelete.onclick = function() {
      let request = new XMLHttpRequest()
      let id = currentButton.parentElement.id
      request.open('DELETE', `http://localhost:3000/api/contacts/${id}`)
      request.send()

      currentButton.parentElement.remove();
      modal.style.display = 'none';
      fillform()
    }
  })()


//  This adds the search functionality

  document.getElementById('name').addEventListener('keyup', function(event) {
    let val = this.value
    document.querySelectorAll('.nameClass').forEach(name => {
      if (name.textContent.toLowerCase().startsWith(val.toLowerCase())) {
        name.closest('ul').style.display = 'block'
      } else {
        name.closest('ul').style.display = 'none'
      }
    })
    if (Array.from(document.querySelectorAll('ul')).every(ul => ul.style.display === 'none')) {
      document.getElementById('noContacts').style.display='block'
      document.getElementById('search').textContent = val
    } else {
      document.getElementById('noContacts').style.display='none'
    }
  })

  document.querySelector('#add').addEventListener('submit', event => {
    event.preventDefault()
    document.querySelector('#submission').reset()
    addHide("submissionForm")
  })

  // This is for the Add Contact button

  document.querySelector('.addContact').addEventListener('click', () => {
    addHide("submissionForm")
  })
  
  document.querySelector("#submission").addEventListener('submit', event => {
    event.preventDefault()

    let formData = new FormData(document.querySelector("#submission"))
    let obj = {}
    for (let entry of formData.entries()) {
      obj[entry[0]] =entry[1]
    }
    console.log(obj)
    validate(obj, 'nameError', 'emailError', 'phoneError')

    if (Array.from(document.querySelectorAll('.error')).every(err => err.style.display === 'none')) {
      let request = new XMLHttpRequest()
      request.open("POST", 'http://localhost:3000/api/contacts/')
      request.setRequestHeader('Content-Type', 'application/json')
  
      request.addEventListener('load', () => {
        fillform()
         hideForm()
        document.getElementById('updateForm').style.display='none'
      })
  
      request.send(JSON.stringify(obj))
    }
  })
  
  document.querySelector("#updateForm").addEventListener('submit', event => {
    event.preventDefault()
    let formData = new FormData(document.querySelector("#update"))
    let obj = {}
    for (let entry of formData.entries()) {
      obj[entry[0]] =entry[1]
    }
  
    validate(obj, 'edit_nameError', 'edit_emailError', 'edit_phoneError')

    if (Array.from(document.querySelectorAll('.error')).every(err => err.style.display === 'none')) {
      document.querySelector("#update").reset()
      let starter = document.querySelector("#updateForm").getAttribute('data-id')
      let request = new XMLHttpRequest()
      request.open('PUT', `http://localhost:3000/api/contacts/${starter}`)
      request.setRequestHeader('Content-Type', 'application/json')
  
      request.addEventListener('load', () => {
        fillform()
        hideForm()
        document.getElementById('updateForm').style.display='none'
      })
      request.send(JSON.stringify(obj))
    }
  })

  function addHide(form) {
    document.getElementById('addForm').style.display='none'
    document.getElementById(form).style.display='block'
    document.getElementById("contact-handle").style.display='none'
    document.getElementById('contact-add').style.display='none'
    document.getElementById('noContacts').style.display='none'
    document.getElementById('name').value = ''
  }

  function hideForm() {
    document.getElementById("submissionForm").style.display='none'
    document.getElementById('addForm').style.display='block'
    document.getElementById("contact-handle").style.display='block'
  }

  document.getElementById('cancel').addEventListener('click', event => {
    fillform()
    hideForm()
  })

  document.getElementById('edit_cancel').addEventListener('click', event => {
    hideForm()
    document.getElementById('updateForm').style.display='none'
  })
  
  function validate(obj, nameError, emailError, phoneError) {

    validation(obj.full_name, "^[a-zA-Z\s' -]+$", nameError);
    validation(obj.email, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", emailError);
    validation(obj.phone_number, "^(\\d{10}|\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\)\\d{3}-\\d{4})$", phoneError);

    function validation(key, regex, id) {
      let newRegex = new RegExp(regex)
      if (!key.match(newRegex)) {
        document.getElementById(id).style.display = 'block'
        document.getElementById(id).previousElementSibling.classList.add('errorbox')
      } else {
        document.getElementById(id).style.display = 'none'
        document.getElementById(id).previousElementSibling.classList.remove('errorbox')
      }
    }
  }

})








