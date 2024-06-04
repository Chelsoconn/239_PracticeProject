document.addEventListener('DOMContentLoaded', () => {

  let modal = document.getElementById('myModal');
  let confirmDelete = document.getElementById('confirmDelete');
  let cancelDelete = document.getElementById('cancelDelete');
  let currentButton;
  let bool = true
    
  function hideTags(initial, compare) {
    Array.prototype.slice.call(document.getElementById(initial).children).forEach(option => {
      option.style.display = (option.value === compare && compare !== '') ? 'none' : 'block'
    })
  }

  function fillform() {
    let request = new XMLHttpRequest()
    request.open('GET', 'http://localhost:3000/api/contacts')
    request.responseType = 'json'
    request.addEventListener('load', event => {
      if (request.response.length === 0) {
        document.getElementById('contact-add').style.display='block'
      } else {
        document.getElementById('contact-add').style.display='none'
      }
      let search = document.querySelectorAll('.addForm')
      if (request.response.length === 0) {
        search.forEach(el => el.style.display = 'none')
      } else {
        search.forEach(el => el.style.display = 'block')
      }
      fillContacts(request.response)
    })
    request.send()
  }

  function format(number) {
    if (number.match(/\d{3}-\d{3}-\d{4}/)) {
      return number
    } else if (number.match(/^\(\d{3}\)\d{3}-\d{4}$/)) {
      number = number.replace('(', '')
      number = number.replace(')', '-')
    } else {
      let arr = number.split('');
      arr.splice(3, 0, '-');
      arr.splice(7, 0, '-');
      number = arr.join('')
    }
    return number
  }
  
  function fillContacts(response) {
    response.forEach(el => el.phone_number = format(el.phone_number))
    var templateSource = document.getElementById("contacts").innerHTML;
    var template = Handlebars.compile(templateSource);
    var compiledHtml = template(response);
    document.getElementById("contacts-list").innerHTML = compiledHtml;
    if (bool) {
      bool = false
      addList()
    }
  }
    
  function setTags(element, num, arr) {
    if (element.value === arr[num]) {
      element.setAttribute('selected', 'selected')
    } else {
      element.removeAttribute('selected');
    }
  }

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

  function notification(searchName, searchTag, phrase) {
    let search = document.getElementById('search')
    if (Array.prototype.slice.call((document.querySelectorAll('ul'))).every(ul => ul.style.display === 'none')) {
      document.getElementById('noContacts').style.display='block'
      if (searchName.length > 0 && searchTag.length> 0) {
        search.textContent = `starting with ${searchName} with the Tag: ${searchTag}`
      } else {
        search.textContent = phrase
      }
    } else {
      document.getElementById('noContacts').style.display='none'
    }
    if (searchTag === '' && searchName === '') document.getElementById('noContacts').style.display='none'
  }

  function addList() {
    let buttons = document.querySelector('#contact-handle');

    buttons.addEventListener('click', event => {
      if (event.target.hasAttribute('data-delete')) {
        modal.style.display = 'block';
        currentButton = event.target;
      } else if (event.target.hasAttribute('data-edit')) { //fix the edit 
        addHide("updateForm")
        let parent = event.target.parentElement
        let id = parent.id
        document.getElementById("edit_full_Name").value = parent.children[0].textContent
        document.getElementById("edit_phone_number").value = parent.children[2].textContent
        document.getElementById("edit_email").value = parent.children[4].textContent
       
        let tagsArr = parent.children[6].textContent.split(',')
        if (tagsArr.length < 2) tagsArr.push('')
        Array.prototype.slice.call(document.getElementById("updateTags1").children).forEach(el => setTags(el, 0, tagsArr))
        Array.prototype.slice.call(document.getElementById("updateTags2").children).forEach(el => setTags(el, 1, tagsArr))
        
        document.querySelector("#updateForm").setAttribute('data-id', id)
      }
    })
  }

  function getTags(obj, one, two) {
    let tags = null
    if (obj[one] && !obj[two]) {
      tags = obj[one]
    } else if (obj[two] && !obj[one]) {
      tags = obj[two]
    } else if (obj[one] && obj[two]) {
      tags = obj[one] + ',' + obj[two]
    } 
    delete obj[one], obj[two]
    obj.tags = tags
  }

  function addHide(form) {
    document.querySelectorAll('.addForm').forEach(el => el.style.display='none')
    document.getElementById(form).style.display='block'
    document.getElementById("contact-handle").style.display='none'
    document.getElementById('contact-add').style.display='none'
    document.getElementById('noContacts').style.display='none'
    document.getElementById('name').value = ''
    document.getElementById('searchTags').value = ''
  }

  function hideForm() {
    document.getElementById("submissionForm").style.display='none'
    document.querySelectorAll('.addForm').forEach(el => el.style.display='block')
    document.getElementById("contact-handle").style.display='block'
  }
  
  function clearErrors() {
    Array.prototype.slice.call(document.querySelectorAll('.error')).every(err => err.style.display = 'none')
    Array.prototype.slice.call(document.getElementsByClassName('errorbox')).forEach(el => el.classList.remove('errorbox'))  
  }

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

  fillform()

  document.getElementById('name').addEventListener('keyup', function(event) {
    let searchName = this.value
    let searchTag = document.getElementById('searchTags').value

    document.querySelectorAll('.nameClass').forEach(name => {
      if (name.textContent.toLowerCase().startsWith(searchName.toLowerCase())) {
        name.closest('ul').style.display = 'block'

        document.querySelectorAll('.tags').forEach(tag => {
          if (!tag.textContent.includes(searchTag)) {
            tag.closest('ul').style.display = 'none'
          }
        })
      } else {
        name.closest('ul').style.display = 'none'
      }
    })
    notification(searchName, searchTag, `starting with ${searchName}`)
  })


  document.getElementById('searchTags').addEventListener('change', event => {
    let searchName = document.querySelector('#name').value
    let searchTag = event.target.value

    document.querySelectorAll('.tags').forEach(tag => {
      if (tag.textContent.includes(searchTag)) {
        tag.closest('ul').style.display = 'block'

        document.querySelectorAll('.nameClass').forEach(name => {
          if (!name.textContent.toLowerCase().startsWith(searchName.toLowerCase())) {
            name.closest('ul').style.display = 'none'
          }
        })
      } else {
        tag.closest('ul').style.display = 'none'
      }
    })
    notification(searchName, searchTag, `with the Tag: ${searchTag}`)
  })


  document.querySelectorAll('.addContact').forEach(el => {
    el.addEventListener('click', () => {
      clearErrors() 
      addHide("submissionForm")
      document.querySelector('#submission').reset()
    })
  })

  
  document.querySelector("#submission").addEventListener('submit', event => {
    event.preventDefault()

    let formData = new FormData(document.querySelector("#submission"))
    let obj = {}

    for (let entry of formData.entries()) {
      obj[entry[0]] = entry[1]
    }
    getTags(obj, 'tags1', 'tags2')

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
    
    getTags(obj, 'updateTags1', 'updateTags2')
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


  document.getElementById('cancel').addEventListener('click', event => {
    clearErrors()
    fillform()
    hideForm()
  })


  document.getElementById('edit_cancel').addEventListener('click', event => {
    hideForm()
    document.getElementById('updateForm').style.display='none'
  })
  

  document.querySelectorAll('.twoTags').forEach(el => {
    el.addEventListener('change', event => {
      let tag1 = el.children[1]
      let tag2 = el.children[3]

      let [tags1, tags2] = [tag1.id, tag2.id]
      let [tagOne, tagTwo] = [tag1.value, tag2.value]

      hideTags(tags1, tagTwo)
      hideTags(tags2, tagOne)
    })
  })

})








